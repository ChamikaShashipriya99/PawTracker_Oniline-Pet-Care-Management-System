// Import mongoose using ESM syntax
import mongoose from "mongoose";

// Define the advertisement schema
const advertisementSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  advertisementType: { type: String, required: true },
  petType: { type: String }, // Optional for "Sell a Pet"
  heading: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String }, // Filename of uploaded image
  status: { type: String, default: "Pending" },
  paymentStatus: { type: String, default: "Pending" },
});

// Export the Advertisement model
export const Advertisement = mongoose.model("Advertisement", advertisementSchema);