import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  contactNumber: { 
    type: String, 
    required: [true, 'Contact number is required'],
    trim: true
  },
  advertisementType: {
    type: String,
    enum: {
      values: ["Sell a Pet", "Lost Pet", "Found Pet"],
      message: '{VALUE} is not a valid advertisement type'
    },
    required: [true, 'Advertisement type is required']
  },
  petType: { 
    type: String, 
    enum: {
      values: ["Cat", "Dog", "Bird", "Fish", "Other", ""],
      message: '{VALUE} is not a valid pet type'
    },
    default: ""
  },
  petPrice: {
    type: Number,
    min: [0, 'Pet price cannot be negative'],
    required: function() {
      return this.advertisementType === "Sell a Pet";
    }
  },
  advertisementCost: {
    type: Number,
    required: [true, 'Advertisement cost is required'],
    validate: {
      validator: function(value) {
        if (this.advertisementType === "Sell a Pet") {
          return value === 1000;
        } else {
          return value === 500;
        }
      },
      message: 'Invalid advertisement cost for the selected type'
    }
  },
  heading: { 
    type: String, 
    required: [true, 'Heading is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true
  },
  photo: { 
    type: String,
    required: [true, 'Photo is required']
  },
  status: { 
    type: String, 
    enum: {
      values: ["Pending", "Approved", "Rejected"],
      message: '{VALUE} is not a valid status'
    },
    default: "Pending"
  },
  paymentStatus: { 
    type: String, 
    enum: {
      values: ["Pending", "Paid"],
      message: '{VALUE} is not a valid payment status'
    },
    default: "Pending"
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Advertisement', advertisementSchema);