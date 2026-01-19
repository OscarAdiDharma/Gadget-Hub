const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['root', 'branch_admin', 'agent', 'customer'], 
    default: 'customer' 
  },
  branchLocation: { type: String, default: 'General' } // Untuk membedakan cabang
});

module.exports = mongoose.model('User', UserSchema);