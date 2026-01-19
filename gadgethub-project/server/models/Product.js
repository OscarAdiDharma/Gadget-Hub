const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: String,
  category: { type: String, enum: ['iPhone', 'Android'], required: true },
  brand: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Available' },
  // --- FITUR BARU ---
  isBU: { type: Boolean, default: false }, // Status Butuh Uang
  negotiable: { type: Boolean, default: true }, // Status Bisa Nego
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);