const mongoose = require('mongoose');

const nailColorSchema = new mongoose.Schema({
  colorName: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  colorCode: { type: String, required: true },
  finishType: { type: String, enum: ['glossy','matte','glitter','shimmer','cream','gel'], required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['available','out-of-stock'], default: 'available' }
}, { timestamps: true });

nailColorSchema.pre('save', function(next) {
  this.status = this.quantity > 0 ? 'available' : 'out-of-stock';
  next();
});

module.exports = mongoose.model('NailColor', nailColorSchema);
