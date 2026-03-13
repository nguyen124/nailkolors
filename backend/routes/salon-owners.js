const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const SalonOwner = require('../models/SalonOwner');
const NailColor = require('../models/NailColor');
const { auth, adminOnly, salonOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/salon-owners/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

async function generateSlug(salonName) {
  const base = salonName.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existing = await SalonOwner.find({ slug: new RegExp('^' + base + '(-\\d+)?$') });
  if (existing.length === 0) return base;
  return `${base}-${existing.length + 1}`;
}

// GET all salon owners (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const owners = await SalonOwner.find().populate('userId', 'name email phone');
    res.json(owners);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET by slug (public)
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const profile = await SalonOwner.findOne({ slug: req.params.slug }).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Salon not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my profile (salon_owner)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await SalonOwner.findOne({ userId: req.user.id }).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST — admin creates a salon owner account + profile
router.post('/', auth, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const { name, email, password, phone, salonName, address, bio } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: password || 'owner123', phone: phone || '', role: 'salon_owner' });
      await user.save();
    } else if (user.role !== 'salon_owner') {
      return res.status(400).json({ message: 'Email already registered with a different role' });
    }
    const data = { userId: user._id, salonName, address: address || '', bio: bio || '', phone: phone || '' };
    if (req.file) data.logo = `/uploads/salon-owners/${req.file.filename}`;
    data.slug = await generateSlug(salonName);
    const profile = new SalonOwner(data);
    await profile.save();
    res.status(201).json({ ...profile.toObject(), userId: { _id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT — admin edits any; salon_owner edits own profile
router.put('/:id', auth, salonOwnerOrAdmin, upload.single('logo'), async (req, res) => {
  try {
    const profile = await SalonOwner.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'salon_owner' && String(profile.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not your profile' });
    }
    const data = { ...req.body };
    if (req.file) data.logo = `/uploads/salon-owners/${req.file.filename}`;
    const updated = await SalonOwner.findByIdAndUpdate(req.params.id, data, { new: true }).populate('userId', 'name email phone');
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE — admin only (removes profile, user account, and all their colors)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const profile = await SalonOwner.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Not found' });
    await NailColor.deleteMany({ salonId: profile._id });
    await SalonOwner.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(profile.userId);
    res.json({ message: 'Salon owner removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
