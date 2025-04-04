// server/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    petOwner: { type: String, required: true },
    petName: { type: String, required: true },
    serviceType: { type: String, enum: ['Vet Service', 'Pet Grooming', 'Pet Training'], required: true },
    trainingType: { type: String, enum: ['Private', 'Group', 'N/A'], default: 'N/A' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    notes: { type: String }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;