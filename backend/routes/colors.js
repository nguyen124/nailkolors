const express = require('express');
const multer = require('multer');
const path = require('path');
const NailColor = require('../models/NailColor');
const { auth, adminOnly, salonOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/colors/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET — public for main salon colors; authenticated salon_owner gets own colors
router.get('/', async (req, res) => {
  try {
    const { finishType, status, owner } = req.query;
    const filter = {};
    if (finishType) filter.finishType = finishType;
    if (status)     filter.status     = status;

    // ?owner=me requires auth token (used by salon owner dashboard)
    if (owner === 'me') {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'Auth required' });
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const SalonOwner = require('../models/SalonOwner');
      const profile = await SalonOwner.findOne({ userId: decoded.id });
      if (!profile) return res.status(404).json({ message: 'Salon owner profile not found' });
      filter.salonId = profile._id;
    } else {
      // Public gallery — only main salon colors
      filter.salonId = null;
    }

    const colors = await NailColor.find(filter).sort({ brand: 1, colorName: 1 });
    res.json(colors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST — admin creates main salon color (salonId=null); salon_owner creates own color
router.post('/', auth, salonOwnerOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/colors/${req.file.filename}`;
    data.quantity = parseInt(data.quantity) || 0;
    if (req.user.role === 'admin') {
      data.salonId = null;
    } else {
      const SalonOwner = require('../models/SalonOwner');
      const profile = await SalonOwner.findOne({ userId: req.user.id });
      data.salonId = profile?._id || null;
    }
    const color = new NailColor(data);
    await color.save();
    res.status(201).json(color);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT — admin can edit any; salon_owner can only edit own
router.put('/:id', auth, salonOwnerOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const color = await NailColor.findById(req.params.id);
    if (!color) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'salon_owner') {
      const SalonOwner = require('../models/SalonOwner');
      const profile = await SalonOwner.findOne({ userId: req.user.id });
      if (!profile || String(color.salonId) !== String(profile._id)) {
        return res.status(403).json({ message: 'Not your color' });
      }
    }
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

// DELETE — admin can delete any; salon_owner can only delete own
router.delete('/:id', auth, salonOwnerOrAdmin, async (req, res) => {
  try {
    const color = await NailColor.findById(req.params.id);
    if (!color) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'salon_owner') {
      const SalonOwner = require('../models/SalonOwner');
      const profile = await SalonOwner.findOne({ userId: req.user.id });
      if (!profile || String(color.salonId) !== String(profile._id)) {
        return res.status(403).json({ message: 'Not your color' });
      }
    }
    await NailColor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Color deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
