const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petName: { type: String, required: true },
  breed: { type: String, required: true },
  birthday: { type: Date, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  specialConditions: { type: String },
  petPhoto: { type: String } 
});

module.exports = mongoose.model('Pet', petSchema);