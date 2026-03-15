const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Technician = require('../models/Technician');
const { auth } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' }
);

// Register
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['customer'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phone } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, phone: phone || '', role: 'customer' });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Seed admin (run once)
router.post('/seed-admin', async (req, res) => {
  const ADMIN_EMAIL = 'thanhtktran88@gmail.com';
  const ADMIN_PASSWORD = 'Tr@nTh1K1mTh@nh031088';
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      existing.email = ADMIN_EMAIL;
      existing.password = ADMIN_PASSWORD;
      await existing.save();
      return res.json({ message: 'Admin updated', email: ADMIN_EMAIL });
    }
    const admin = new User({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    await admin.save();
    res.json({ message: 'Admin created', email: ADMIN_EMAIL });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
