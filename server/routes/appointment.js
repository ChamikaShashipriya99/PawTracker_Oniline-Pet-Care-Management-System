const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// GET all appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new appointment
router.post('/', async (req, res) => {
    try {
        const { petOwner, petName, serviceType, trainingType, date, time, amount, notes } = req.body;

        if (!petOwner || petOwner.trim().length < 2) {
            return res.status(400).json({ message: 'Pet owner name must be at least 2 characters' });
        }
        if (!petName || petName.trim().length < 2) {
            return res.status(400).json({ message: 'Pet name must be at least 2 characters' });
        }
        if (!serviceType || !['Vet Service', 'Pet Grooming', 'Pet Training'].includes(serviceType)) {
            return res.status(400).json({ message: 'Invalid service type' });
        }
        if (serviceType === 'Pet Training' && !['Private', 'Group'].includes(trainingType)) {
            return res.status(400).json({ message: 'Invalid training type for Pet Training' });
        }
        if (!date || new Date(date) < new Date()) {
            return res.status(400).json({ message: 'Date must be in the future' });
        }
        if (!time) {
            return res.status(400).json({ message: 'Time is required' });
        } else {
            const [hours, minutes] = time.split(':').map(Number);
            if (hours < 9 || hours >= 17) {
                return res.status(400).json({ message: 'Time must be between 9:00 AM and 5:00 PM' });
            }
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const appointment = new Appointment({
            petOwner,
            petName,
            serviceType,
            trainingType: trainingType || 'N/A',
            date: new Date(date),
            time,
            amount: Number(amount),
            notes: notes || '',
            status: 'Pending'
        });

        const savedAppointment = await appointment.save();
        return res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: savedAppointment
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Error saving appointment'
        });
    }
});

// PATCH update appointment (including status for rejection)
router.patch('/:id', async (req, res) => {
    try {
        const { petName, date, time, notes, status } = req.body;

        // Validations for editable fields
        if (petName && petName.trim().length < 2) {
            return res.status(400).json({ message: 'Pet name must be at least 2 characters' });
        }
        if (date && new Date(date) < new Date()) {
            return res.status(400).json({ message: 'Date must be in the future' });
        }
        if (time) {
            const [hours, minutes] = time.split(':').map(Number);
            if (hours < 9 || hours >= 17) {
                return res.status(400).json({ message: 'Time must be between 9:00 AM and 5:00 PM' });
            }
        }
        if (status && !['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { petName, date: date && new Date(date), time, notes, status },
            { new: true, runValidators: true }
        );
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH approve appointment
router.patch('/approve/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved' },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;