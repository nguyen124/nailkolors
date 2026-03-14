const express = require('express');
const AddOn = require('../models/AddOn');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public: get all active add-ons, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) {
      filter.$or = [
        { applicableCategories: category },
        { applicableCategories: { $size: 0 } }
      ];
    }
    const addons = await AddOn.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json(addons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: get all (including inactive)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const addons = await AddOn.find().sort({ sortOrder: 1, name: 1 });
    res.json(addons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const addon = new AddOn(req.body);
    await addon.save();
    res.status(201).json(addon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const addon = await AddOn.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(addon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await AddOn.findByIdAndDelete(req.params.id);
    res.json({ message: 'Add-on deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
