const mongoose = require('mongoose');

const salonOwnerSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  salonName: { type: String, required: true, trim: true },
  address:   { type: String, default: '' },
  phone:     { type: String, default: '' },
  bio:       { type: String, default: '' },
  logo:      { type: String, default: '' },
  slug:      { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model('SalonOwner', salonOwnerSchema);
