// server/controllers/appointmentController.js
const Appointment = require('../models/appointmentModel');
// const { sendNotification } = require('../utils/notifications'); // Uncomment if notifications are implemented
const User = require('../models/userModel'); // Uncomment if user authentication is implemented

// Get all appointments (used by MyAppointments.js and AdminAppointments.js)
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        // MyAppointments.js and AdminAppointments.js expect a simple array
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
};

// Get user appointments (not currently used by frontend, but keeping for future use)
exports.getUserAppointments = async (req, res) => {
    try {
        // If authentication is implemented, uncomment the following:
        // if (!req.user) {
        //     return res.status(401).json({ message: 'User not authenticated' });
        // }
        // const appointments = await Appointment.find({ userId: req.user.id });
        // For now, since frontend doesn't use userId, return all appointments
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
};

// Get single appointment (used by ViewAppointment.js and EditAppointment.js)
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // If authentication is implemented, uncomment the following:
        // if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(401).json({ message: 'Not authorized to access this appointment' });
        // }

        // ViewAppointment.js and EditAppointment.js expect the appointment object directly
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
    }
};

// Create new appointment (used by BookAppointment.js)
exports.createAppointment = async (req, res) => {
    try {
        // If authentication is implemented, uncomment the following:
        // req.body.userId = req.user.id;

        // Set initial status to Pending (matches frontend expectation)
        req.body.status = 'Pending';

        const appointment = await Appointment.create(req.body);

        // If notifications are implemented, uncomment the following:
        // const admins = await User.find({ role: 'admin' });
        // admins.forEach(admin => {
        //     sendNotification(
        //         admin.id,
        //         'New Appointment Request',
        //         `A new appointment has been requested by ${req.user.name} for ${req.body.serviceType}`,
        //         {
        //             appointmentId: appointment._id,
        //             type: 'new_appointment'
        //         }
        //     );
        // });

        // BookAppointment.js expects this response format
        res.status(201).json({ message: 'Appointment created successfully', appointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400).json({ message: 'Validation error', errors: messages });
        } else {
            res.status(500).json({ message: 'Failed to create appointment', error: error.message });
        }
    }
};

// Update appointment (used by EditAppointment.js and AdminAppointments.js)
exports.updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // If authentication is implemented, uncomment the following:
        // if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(401).json({ message: 'Not authorized to update this appointment' });
        // }

        // Validate status if provided (used by AdminAppointments.js)
        if (req.body.status && !['Pending', 'Approved', 'Rejected'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected.' });
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // If notifications are implemented, uncomment the following:
        // const user = await User.findById(appointment.userId);
        // if (req.body.status === 'Approved') {
        //     sendNotification(
        //         user.id,
        //         'Appointment Approved',
        //         `Your appointment for ${appointment.serviceType} has been approved.`,
        //         {
        //             appointmentId: appointment._id,
        //             type: 'appointment_status'
        //         }
        //     );
        // } else if (req.body.status === 'Rejected') {
        //     sendNotification(
        //         user.id,
        //         'Appointment Rejected',
        //         `Your appointment for ${appointment.serviceType} has been rejected.`,
        //         {
        //             appointmentId: appointment._id,
        //             type: 'appointment_status'
        //         }
        //     );
        // }

        // EditAppointment.js and AdminAppointments.js expect this response format
        res.status(200).json({ message: 'Appointment updated successfully', appointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400).json({ message: 'Validation error', errors: messages });
        } else {
            res.status(500).json({ message: 'Failed to update appointment', error: error.message });
        }
    }
};

// Delete appointment (used by MyAppointments.js)
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // If authentication is implemented, uncomment the following:
        // if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(401).json({ message: 'Not authorized to delete this appointment' });
        // }

        await appointment.deleteOne();

        // MyAppointments.js expects this response format
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
    }
};

// Approve or reject appointment (admin only) - Consolidated into updateAppointment
// This function is no longer needed since AdminAppointments.js uses PUT /api/appointment/:id
// Keeping it here commented out in case you want to add a dedicated route later
/*
exports.approveAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to perform this action' });
        }

        const { status } = req.body;

        if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Please provide a valid status (Approved, Rejected, or Pending)' });
        }

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        const user = await User.findById(appointment.userId);
        if (status === 'Approved') {
            sendNotification(
                user.id,
                'Appointment Approved',
                `Your appointment for ${appointment.serviceType} has been approved.`,
                {
                    appointmentId: appointment._id,
                    type: 'appointment_status'
                }
            );
        } else if (status === 'Rejected') {
            sendNotification(
                user.id,
                'Appointment Rejected',
                `Your appointment for ${appointment.serviceType} has been rejected.`,
                {
                    appointmentId: appointment._id,
                    type: 'appointment_status'
                }
            );
        }

        res.status(200).json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Failed to update appointment status', error: error.message });
    }
};
*/