const express = require('express');
const Service = require('../models/Service');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadToGCS } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const services = await Service.find(filter).sort({ category: 1, sortOrder: 1, name: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, ...uploadToGCS('services'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.fileUrl) data.image = req.fileUrl;
    const service = new Service(data);
    await service.save();
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, ...uploadToGCS('services'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.fileUrl) data.image = req.fileUrl;
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
