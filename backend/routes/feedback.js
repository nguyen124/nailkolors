const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public: submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const feedback = new Feedback({ name, email, phone, service, message });
    await feedback.save();
    res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: get all feedback
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: mark read/unread
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(feedback);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: delete
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
