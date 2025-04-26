const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePhoto: { type: String },
  resetToken: { type: String }, 
  resetTokenExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpiry: { type: Date }
});

module.exports = mongoose.model('User', userSchema);