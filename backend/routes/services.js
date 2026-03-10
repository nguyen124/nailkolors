const express = require('express');
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/services/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const services = await Service.find(filter).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/services/${req.file.filename}`;
    const service = new Service(data);
    await service.save();
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/services/${req.file.filename}`;
    const service = await Service.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(service);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
