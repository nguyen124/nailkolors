/**
 * Seed script — run once to create/reset the admin account.
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nailkolors';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  phone: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'technician', 'customer'], default: 'customer' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const email = 'admin@nailkolors.com';
  const plainPassword = 'admin1234';
  const hashed = await bcrypt.hash(plainPassword, 10);

  const result = await User.findOneAndUpdate(
    { email },
    { name: 'Admin', email, password: hashed, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✓ Admin account ready');
  console.log('  Email   :', email);
  console.log('  Password:', plainPassword);
  console.log('  Role    :', result.role);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
