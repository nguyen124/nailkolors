const mongoose = require('mongoose');

const nailColorSchema = new mongoose.Schema({
  colorName: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  colorCode: { type: String, required: true },
  finishType: { type: String, enum: ['Shiny', 'Matte', 'Glitter', 'Cat Eyes', 'Holographic'], required: true },
  image: { type: String, default: '' },
  dotImage: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['available','out-of-stock'], default: 'available' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // null = main salon
}, { timestamps: true });

nailColorSchema.pre('save', function(next) {
  this.status = this.quantity > 0 ? 'available' : 'out-of-stock';
  next();
});

module.exports = mongoose.model('NailColor', nailColorSchema);
