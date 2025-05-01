import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDueDate: { type: Date },
  notes: { type: String },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String },
  birthday: { type: Date },
  age: { type: Number },
  weight: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String },
  medicalHistory: { type: String },
  specialNeeds: { type: String },
  vaccinations: [vaccinationSchema],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Pet', petSchema);