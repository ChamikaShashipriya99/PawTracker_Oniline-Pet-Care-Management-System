const Appointment = require('../models/appointmentModel');
const { sendNotification } = require('../utils/notifications');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get user appointments
exports.getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Check if the appointment belongs to the user or if the user is an admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this appointment'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
    try {
        // Add user ID to request body
        req.body.userId = req.user.id;

        // Set initial status to pending
        req.body.status = 'pending';

        // Create appointment
        const appointment = await Appointment.create(req.body);

        // Find admin users to notify
        const admins = await User.find({ role: 'admin' });

        // Send notification to admins
        admins.forEach(admin => {
            sendNotification(
                admin.id,
                'New Appointment Request',
                `A new appointment has been requested by ${req.user.name} for ${req.body.serviceType}`,
                {
                    appointmentId: appointment._id,
                    type: 'new_appointment'
                }
            );
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
    }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Check if the appointment belongs to the user or if the user is an admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this appointment'
            });
        }

        // Update appointment
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
    }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Check if the appointment belongs to the user or if the user is an admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete this appointment'
            });
        }

        await appointment.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Approve or reject appointment (admin only)
exports.approveAppointment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to perform this action'
            });
        }

        const { status } = req.body;

        // Validate status
        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid status (approved, rejected, or pending)'
            });
        }

        // Find appointment
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Update status
        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        // Get user who made the appointment
        const user = await User.findById(appointment.userId);

        // Send notification to user
        if (status === 'approved') {
            sendNotification(
                user.id,
                'Appointment Approved',
                `Your appointment for ${appointment.serviceType} has been approved.`,
                {
                    appointmentId: appointment._id,
                    type: 'appointment_status'
                }
            );
        } else if (status === 'rejected') {
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

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};