import { Schema, model } from 'mongoose';

const advertisementSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  advertisementType: {
    type: String,
    enum: ["Sell a Pet", "Lost Pet", "Found Pet"],
    required: true,
  },
  petType: { type: String, enum: ["Cat", "Dog", "Bird", "Fish", "Other", ""], default: "" },
  heading: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default model('Advertisement', advertisementSchema);