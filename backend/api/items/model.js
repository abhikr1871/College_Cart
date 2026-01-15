const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // Keep for backward compatibility (primary image)
  images: [{ type: String }], // New array for multiple images
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Others' },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'], default: 'Good' },
  brand: { type: String, default: '' },
  negotiable: { type: Boolean, default: false },
  collegeName: { type: String, required: true },
  sellerId: { type: Number, required: true }, // Reference to User
  sellerName: { type: String, required: true }, // Seller's name
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
