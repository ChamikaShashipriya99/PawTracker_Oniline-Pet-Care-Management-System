// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    petOwner: {
        type: String,
        required: [true, 'Pet owner name is required'],
        trim: true
    },
    petName: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: ['Vet Service', 'Pet Grooming', 'Pet Training']
    },
    trainingType: {
        type: String,
        default: 'N/A'
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required']
    },
    notes: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    // If authentication is implemented, uncomment the following:
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);