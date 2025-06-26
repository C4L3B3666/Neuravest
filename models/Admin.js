const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  taxaCrescimento: { type: Number, default: 0.00077 } // 0.077%
});

module.exports = mongoose.model('Admin', adminSchema);