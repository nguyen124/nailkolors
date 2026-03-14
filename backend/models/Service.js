const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 15 }, // in minutes
  category: { type: String, enum: ['Manicure', 'Pedicure', 'Acrylic', 'Builder Gel', 'Sns Dipping', 'Color Change', 'Removal', 'Waxing'], required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 9999 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
