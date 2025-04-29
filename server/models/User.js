import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePhoto: { type: String },
  resetToken: { type: String }, 
  resetTokenExpiry: { type: Date } 
});

export default model('User', userSchema);