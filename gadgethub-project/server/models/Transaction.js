const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  method: { type: String, enum: ['cod_agent', 'cod_mandiri'], required: true },
  agentFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Verified, Completed
  verificationNotes: String, // Catatan Agent
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);