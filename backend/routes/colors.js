const express = require('express');
const NailColor = require('../models/NailColor');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadToGCS } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { finishType, status } = req.query;
    const filter = {};
    if (finishType) filter.finishType = finishType;
    if (status) filter.status = status;
    const colors = await NailColor.find(filter).sort({ brand: 1, colorName: 1 });
    res.json(colors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, ...uploadToGCS('colors'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.fileUrl) data.image = req.fileUrl;
    data.quantity = parseInt(data.quantity) || 0;
    const color = new NailColor(data);
    await color.save();
    res.status(201).json(color);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, ...uploadToGCS('colors'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.fileUrl) data.image = req.fileUrl;
    if (data.quantity !== undefined) {
      data.quantity = parseInt(data.quantity);
      data.status = data.quantity > 0 ? 'available' : 'out-of-stock';
    }
    const color = await NailColor.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(color);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await NailColor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Color deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
