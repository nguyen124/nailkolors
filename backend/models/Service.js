const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 15 }, // in minutes
  category: { type: String, enum: ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'], required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalonOwner', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
