const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  isWorking: { type: Boolean, default: true },
  start: { type: String, default: '09:00' },
  end: { type: String, default: '18:00' }
});

const technicianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  specialties: [{ type: String }],
  workingHours: [workingHoursSchema],
  blockedDates: [{ type: Date }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Technician', technicianSchema);
