// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    petOwner: {
        type: String,
        required: [true, 'Pet owner name is required'],
        trim: true,
        minlength: [2, 'Pet owner name must be at least 2 characters'],
    },
    petName: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        minlength: [2, 'Pet name must be at least 2 characters'],
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: ['Vet Service', 'Pet Grooming', 'Pet Training'],
    },
    trainingType: {
        type: String,
        default: 'N/A',
        enum: ['N/A', 'Private', 'Group'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
    },
    notes: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);

// server/models/Appointment.js

// const appointmentSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     petOwner: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 2
//     },
//     petName: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 2
//     },
//     serviceType: {
//         type: String,
//         required: true,
//         enum: ['Vet Service', 'Pet Grooming', 'Pet Training']
//     },
//     trainingType: {
//         type: String,
//         required: true,
//         enum: ['Private', 'Group', 'N/A']
//     },
//     date: {
//         type: Date,
//         required: true
//     },
//     time: {
//         type: String,
//         required: true,
//         match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
//     },
//     amount: {
//         type: Number,
//         required: [true, 'Amount is required'],
//         min: [0, 'Amount cannot be negative'],
//     },
//     notes: {
//         type: String,
//         trim: true,
//         default: ''
//     },
//     status: {
//         type: String,
//         enum: ['Pending', 'Confirmed', 'Cancelled'],
//         default: 'Pending'
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('Appointment', appointmentSchema);

const generateTimeSlots = (start = 9, end = 17) => {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// Usage in your component:
const timeSlots = generateTimeSlots(); // ["09:00", "09:30", ..., "16:30"]