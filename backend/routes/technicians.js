const express = require('express');
const multer = require('multer');
const path = require('path');
const Technician = require('../models/Technician');
const User = require('../models/User');
const { auth, adminOnly, technicianOrAdmin } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/technicians/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true };
    // Filter by specialty: ?specialty=gel  (matches service category)
    const specialty = req.query.specialty || req.query.serviceCategory;
    if (specialty) filter.specialties = specialty;
    const technicians = await Technician.find(filter).populate('userId', 'name email');
    res.json(technicians);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-profile', auth, technicianOrAdmin, async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id });
    if (!tech) return res.status(404).json({ message: 'Technician profile not found' });
    res.json(tech);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id).populate('userId', 'name email');
    if (!tech) return res.status(404).json({ message: 'Not found' });
    res.json(tech);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Matches salon opening hours: Mon–Sat 9:30am–7pm, Sun 11:30am–5pm
const DEFAULT_WORKING_HOURS = [
  { day: 'Monday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Tuesday',   isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Wednesday', isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Thursday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Friday',    isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Saturday',  isWorking: true, start: '09:30', end: '19:00' },
  { day: 'Sunday',    isWorking: true, start: '11:30', end: '17:00' },
];

router.post('/', auth, adminOnly, upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, bio, specialties, workingHours } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: password || 'tech123', role: 'technician' });
      await user.save();
    }
    const data = {
      userId: user._id, name, bio,
      specialties: specialties ? JSON.parse(specialties) : [],
      workingHours: workingHours ? JSON.parse(workingHours) : DEFAULT_WORKING_HOURS,
    };
    if (req.file) data.photo = `/uploads/technicians/${req.file.filename}`;
    const tech = new Technician(data);
    await tech.save();
    res.status(201).json(tech);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, technicianOrAdmin, upload.single('photo'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/technicians/${req.file.filename}`;
    if (data.specialties && typeof data.specialties === 'string') data.specialties = JSON.parse(data.specialties);
    if (data.workingHours && typeof data.workingHours === 'string') data.workingHours = JSON.parse(data.workingHours);
    if (data.blockedDates && typeof data.blockedDates === 'string') data.blockedDates = JSON.parse(data.blockedDates);
    const tech = await Technician.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(tech);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Technician.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Technician removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
