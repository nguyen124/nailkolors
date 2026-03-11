const express = require('express');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Technician = require('../models/Technician');
const { auth, technicianOrAdmin, adminOnly } = require('../middleware/auth');
const { sendConfirmationEmail } = require('../config/email');

const router = express.Router();

// Get available time slots
router.get('/available-slots', async (req, res) => {
  try {
    const { technicianId, date, serviceId } = req.query;
    if (!technicianId || !date || !serviceId) {
      return res.status(400).json({ message: 'Missing required params' });
    }

    const service = await Service.findById(serviceId);
    const technician = await Technician.findById(technicianId);
    if (!service || !technician) return res.status(404).json({ message: 'Not found' });

    // Parse YYYY-MM-DD as local date (avoid UTC midnight offset shifting the day)
    const [y, mo, d] = date.split('-').map(Number);
    const requestedDate = new Date(y, mo - 1, d);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Fall back to default 9-18 if technician has no working hours configured
    const daySchedule = technician.workingHours.find(wh => wh.day === dayName)
      || { isWorking: true, start: '09:00', end: '18:00' };
    if (!daySchedule.isWorking) {
      return res.json({ slots: [] });
    }

    const isBlocked = technician.blockedDates.some(bd => {
      const blocked = new Date(bd);
      return blocked.toDateString() === requestedDate.toDateString();
    });
    if (isBlocked) return res.json({ slots: [] });

    // Get existing appointments for that day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const existingAppts = await Appointment.find({
      technicianId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] }
    }).populate('serviceId', 'duration');

    const slotDuration = service.duration;
    const [startH, startM] = daySchedule.start.split(':').map(Number);
    const [endH, endM] = daySchedule.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const busySlots = existingAppts.map(appt => {
      const [h, m] = appt.time.split(':').map(Number);
      const apptStart = h * 60 + m;
      const apptEnd = apptStart + (appt.serviceId?.duration || 60);
      return { start: apptStart, end: apptEnd };
    });

    const slots = [];
    for (let t = startMinutes; t + slotDuration <= endMinutes; t += 30) {
      const slotEnd = t + slotDuration;
      const isAvailable = !busySlots.some(b => t < b.end && slotEnd > b.start);
      if (isAvailable) {
        const h = Math.floor(t / 60).toString().padStart(2, '0');
        const m = (t % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    res.json({ slots });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Public: lookup appointments by email/phone
router.get('/lookup', async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) return res.status(400).json({ message: 'Provide email or phone' });
    const filter = {};
    if (email) filter.customerEmail = email.toLowerCase();
    if (phone) filter.customerPhone = phone;
    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name photo')
      .populate('nailColorId', 'colorName brand colorCode')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create appointment (public)
router.post('/', async (req, res) => {
  try {
    let { serviceId, technicianId, nailColorId, customerName, customerPhone, customerEmail, date, time, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Auto-assign: pick a random available technician for this service's category
    if (!technicianId || technicianId === 'auto') {
      const candidates = await Technician.find({ isActive: true, specialties: service.category });
      const pool = candidates.length > 0 ? candidates : await Technician.find({ isActive: true });
      if (!pool.length) return res.status(400).json({ message: 'No technicians available at this time' });
      technicianId = pool[Math.floor(Math.random() * pool.length)]._id;
    }

    // Check for double booking (parse YYYY-MM-DD as local date)
    const [dy, dm, dd] = typeof date === 'string' ? date.split('-').map(Number) : [new Date(date).getFullYear(), new Date(date).getMonth()+1, new Date(date).getDate()];
    const start = new Date(dy, dm - 1, dd, 0, 0, 0, 0);
    const end = new Date(dy, dm - 1, dd, 23, 59, 59, 999);

    const [reqH, reqM] = time.split(':').map(Number);
    const reqStart = reqH * 60 + reqM;
    const reqEnd = reqStart + service.duration;

    const existingAppts = await Appointment.find({
      technicianId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] }
    }).populate('serviceId', 'duration');

    const conflict = existingAppts.some(appt => {
      const [h, m] = appt.time.split(':').map(Number);
      const apptStart = h * 60 + m;
      const apptEnd = apptStart + (appt.serviceId?.duration || 60);
      return reqStart < apptEnd && reqEnd > apptStart;
    });

    if (conflict) return res.status(409).json({ message: 'Time slot not available' });

    const appointment = new Appointment({
      serviceId, technicianId, nailColorId: nailColorId || null,
      customerName, customerPhone, customerEmail, date, time, notes
    });
    await appointment.save();

    const technician = await Technician.findById(technicianId);
    try { await sendConfirmationEmail(appointment, service, technician); } catch (_) { /* email is non-critical */ }

    // Emit socket events
    const io = req.app.get('io');
    const populatedAppt = await Appointment.findById(appointment._id)
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name')
      .populate('nailColorId', 'colorName brand');

    io.to(`technician-${technicianId}`).emit('new-appointment', populatedAppt);
    io.to('admin-room').emit('new-appointment', populatedAppt);

    res.status(201).json(appointment);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Get all appointments (admin/technician)
router.get('/', auth, technicianOrAdmin, async (req, res) => {
  try {
    const { technicianId, date, status, startDate, endDate } = req.query;
    const filter = {};

    // If technician, only see their appointments
    if (req.user.role === 'technician') {
      const tech = await Technician.findOne({ userId: req.user.id });
      if (tech) filter.technicianId = tech._id;
    } else if (technicianId) {
      filter.technicianId = technicianId;
    }

    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name photo')
      .populate('nailColorId', 'colorName brand colorCode')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, technicianOrAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name')
      .populate('nailColorId', 'colorName brand');

    const io = req.app.get('io');
    io.to('admin-room').emit('appointment-updated', appointment);
    if (appointment.technicianId) {
      io.to(`technician-${appointment.technicianId._id}`).emit('appointment-updated', appointment);
    }
    res.json(appointment);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Public cancel by email/phone
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { customerEmail, customerPhone } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    if (appointment.customerEmail !== customerEmail && appointment.customerPhone !== customerPhone) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
