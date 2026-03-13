const express = require('express');
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
const Technician = require('../models/Technician');
const NailColor = require('../models/NailColor');
const Post = require('../models/Post');
const Appointment = require('../models/Appointment');
const SalonOwner = require('../models/SalonOwner');
const User = require('../models/User');
const { auth, salonOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer for different upload types
const makeUpload = (dest) => multer({
  storage: multer.diskStorage({
    destination: `uploads/${dest}/`,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  })
});

// Middleware: load salon owner profile, set req.salonId
const withSalonOwner = async (req, res, next) => {
  try {
    if (req.user.role === 'admin' && req.query.salonId) {
      req.salonId = req.query.salonId;
      return next();
    }
    if (req.user.role === 'salon_owner') {
      const profile = await SalonOwner.findOne({ userId: req.user.id });
      if (!profile) return res.status(404).json({ message: 'Salon owner profile not found' });
      req.salonId = profile._id;
      req.salon = profile;
      return next();
    }
    if (req.user.role === 'admin') {
      req.salonId = null;
      return next();
    }
    return res.status(403).json({ message: 'Access denied' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PROFILE ──────────────────────────────────────────────────────────
router.get('/profile', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const profile = await SalonOwner.findById(req.salonId).populate('userId', 'name email phone');
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── SERVICES ─────────────────────────────────────────────────────────
router.get('/services', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const services = await Service.find({ salonId: req.salonId }).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/services', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('services').single('image'), async (req, res) => {
  try {
    const data = { ...req.body, salonId: req.salonId };
    if (req.file) data.image = `/uploads/services/${req.file.filename}`;
    const service = new Service(data);
    await service.save();
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/services/:id', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('services').single('image'), async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!service) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/services/${req.file.filename}`;
    const updated = await Service.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/services/:id', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!service) return res.status(404).json({ message: 'Not found' });
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── COLORS ───────────────────────────────────────────────────────────
router.get('/colors', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const filter = { salonId: req.salonId };
    if (req.query.status) filter.status = req.query.status;
    const colors = await NailColor.find(filter).sort({ brand: 1, colorName: 1 });
    res.json(colors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/colors', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('colors').single('image'), async (req, res) => {
  try {
    const data = { ...req.body, salonId: req.salonId };
    if (req.file) data.image = `/uploads/colors/${req.file.filename}`;
    data.quantity = parseInt(data.quantity) || 0;
    const color = new NailColor(data);
    await color.save();
    res.status(201).json(color);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/colors/:id', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('colors').single('image'), async (req, res) => {
  try {
    const color = await NailColor.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!color) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/colors/${req.file.filename}`;
    if (data.quantity !== undefined) {
      data.quantity = parseInt(data.quantity);
      data.status = data.quantity > 0 ? 'available' : 'out-of-stock';
    }
    const updated = await NailColor.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/colors/:id', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const color = await NailColor.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!color) return res.status(404).json({ message: 'Not found' });
    await NailColor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── TECHNICIANS ──────────────────────────────────────────────────────
const DEFAULT_WORKING_HOURS = [
  { day: 'Monday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Tuesday',   isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Wednesday', isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Thursday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Friday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Saturday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Sunday',    isWorking: true, start: '11:30', end: '17:00' },
];

router.get('/technicians', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const techs = await Technician.find({ salonId: req.salonId, isActive: true }).populate('userId', 'name email');
    res.json(techs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/technicians', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('technicians').single('photo'), async (req, res) => {
  try {
    const { name, email, password, bio, specialties, workingHours } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: password || 'tech123', role: 'technician' });
      await user.save();
    }
    const data = {
      userId: user._id, name, bio, salonId: req.salonId,
      specialties: specialties ? JSON.parse(specialties) : [],
      workingHours: workingHours ? JSON.parse(workingHours) : DEFAULT_WORKING_HOURS,
    };
    if (req.file) data.photo = `/uploads/technicians/${req.file.filename}`;
    const tech = new Technician(data);
    await tech.save();
    res.status(201).json(tech);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/technicians/:id', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('technicians').single('photo'), async (req, res) => {
  try {
    const tech = await Technician.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!tech) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/technicians/${req.file.filename}`;
    if (data.specialties && typeof data.specialties === 'string') data.specialties = JSON.parse(data.specialties);
    if (data.workingHours && typeof data.workingHours === 'string') data.workingHours = JSON.parse(data.workingHours);
    const updated = await Technician.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/technicians/:id', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const tech = await Technician.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!tech) return res.status(404).json({ message: 'Not found' });
    await Technician.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(tech.userId);
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POSTS ─────────────────────────────────────────────────────────────
router.get('/posts', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const posts = await Post.find({ salonId: req.salonId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/posts', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('posts').single('image'), async (req, res) => {
  try {
    const data = { ...req.body, salonId: req.salonId };
    if (req.file) data.image = `/uploads/posts/${req.file.filename}`;
    const post = new Post(data);
    await post.save();
    res.status(201).json(post);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/posts/:id', auth, salonOwnerOrAdmin, withSalonOwner, makeUpload('posts').single('image'), async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!post) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/posts/${req.file.filename}`;
    const updated = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/posts/:id', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, salonId: req.salonId });
    if (!post) return res.status(404).json({ message: 'Not found' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── APPOINTMENTS ─────────────────────────────────────────────────────
router.get('/appointments', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    // Get technician IDs belonging to this salon
    const techs = await Technician.find({ salonId: req.salonId }).select('_id');
    const techIds = techs.map(t => t._id);
    const filter = { technicianId: { $in: techIds } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const [y, mo, d] = req.query.date.split('-').map(Number);
      filter.date = { $gte: new Date(y, mo - 1, d), $lt: new Date(y, mo - 1, d + 1) };
    }
    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name photo')
      .sort({ date: -1, time: 1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/appointments/:id', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const techs = await Technician.find({ salonId: req.salonId }).select('_id');
    const techIds = techs.map(t => t._id.toString());
    const appt = await Appointment.findById(req.params.id);
    if (!appt || !techIds.includes(appt.technicianId.toString())) {
      return res.status(403).json({ message: 'Not your appointment' });
    }
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('serviceId', 'name price duration')
      .populate('technicianId', 'name photo');
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ── ANALYTICS ────────────────────────────────────────────────────────
router.get('/analytics', auth, salonOwnerOrAdmin, withSalonOwner, async (req, res) => {
  try {
    const techs = await Technician.find({ salonId: req.salonId }).select('_id name');
    const techIds = techs.map(t => t._id);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

    const [todayAppts, weekAppts, services, colors] = await Promise.all([
      Appointment.countDocuments({ technicianId: { $in: techIds }, date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } }),
      Appointment.find({ technicianId: { $in: techIds }, date: { $gte: weekAgo }, status: { $ne: 'cancelled' } }).populate('serviceId', 'price'),
      Service.countDocuments({ salonId: req.salonId, isActive: true }),
      NailColor.countDocuments({ salonId: req.salonId }),
    ]);

    const weeklyRevenue = weekAppts.reduce((sum, a) => sum + (a.serviceId?.price || 0), 0);
    res.json({ todayTotal: todayAppts, weeklyTotal: weekAppts.length, weeklyRevenue, totalServices: services, totalColors: colors });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
