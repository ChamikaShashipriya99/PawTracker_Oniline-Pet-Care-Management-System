// // server/routes/appointmentRoutes.js
// const express = require('express');
// const router = express.Router();
// const appointmentController = require('../Controllers/appointmentController');

// // GET all appointments (used by MyAppointments.js and AdminAppointments.js)
// router.get('/', appointmentController.getAllAppointments);

// // GET user appointments (not currently used by frontend, but keeping for future use)
// router.get('/user', appointmentController.getUserAppointments);

// // GET single appointment by ID (used by ViewAppointment.js and EditAppointment.js)
// router.get('/:id', appointmentController.getAppointment);

// // POST new appointment (used by BookAppointment.js)
// router.post('/', appointmentController.createAppointment);

// // PUT update appointment (used by EditAppointment.js and AdminAppointments.js for status updates)
// router.put('/:id', appointmentController.updateAppointment);

// // DELETE appointment (used by MyAppointments.js)
// router.delete('/:id', appointmentController.deleteAppointment);

// module.exports = router;

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all appointments (admin only) - must be before the general auth middleware
router.get('/all', adminAuth, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('petOwner', 'name email')
            .sort({ date: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Apply auth middleware to all routes except admin routes
router.use((req, res, next) => {
    if (req.path === '/all' || req.path.startsWith('/admin')) {
        next();
    } else {
        auth(req, res, next);
    }
});

// Create appointment
router.post('/', auth, async (req, res) => {
    try {
        const user = req.user;
        const appointment = new Appointment({
            ...req.body,
            userId: user._id,
            petOwner: `${user.firstName} ${user.lastName}`
        });
        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's appointments
router.get('/my-appointments', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id })
            .sort({ date: -1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update appointment status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only create notification if status is changing
        if (appointment.status !== status) {
            // Create notification for the pet owner
            const notification = new Notification({
                userId: appointment.userId,
                title: 'Appointment Status Updated',
                message: `Your appointment for ${appointment.serviceType} on ${appointment.date} has been ${status.toLowerCase()}.`,
                type: 'appointment_status',
                appointmentId: appointment._id
            });

            try {
                await notification.save();
            } catch (notificationError) {
                console.error('Error creating notification:', notificationError);
                // Continue with the status update even if notification fails
            }
        }

        // Update only the status field using findByIdAndUpdate
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to update this appointment
        if (!req.user.isAdmin && appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this appointment' });
        }

        // Update appointment fields
        appointment.petName = req.body.petName;
        appointment.date = req.body.date;
        appointment.time = req.body.time;
        appointment.notes = req.body.notes || '';

        await appointment.save();
        res.json({ message: 'Appointment updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single appointment by ID (must be after all other routes)
router.get('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to view this appointment
        if (!req.user.isAdmin && appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to view this appointment' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to delete this appointment
        if (!req.user.isAdmin && appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this appointment' });
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;