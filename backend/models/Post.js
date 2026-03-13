const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  publishDate: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalonOwner', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
