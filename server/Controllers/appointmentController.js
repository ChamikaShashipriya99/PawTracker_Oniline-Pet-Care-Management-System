const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
    try {
        const { serviceType, sortBy = 'date', order = 'asc' } = req.query;
        let query = {};

        // Add user ID filter if user is not admin
        if (!req.user.isAdmin) {
            query.userId = req.user._id;
        }

        // Filter by service type if provided
        if (serviceType) {
            query.serviceType = serviceType;
        }

        // Fetch appointments with filtering
        let appointments = await Appointment.find(query);

        // Sort appointments
        appointments.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'serviceType') {
                comparison = a.serviceType.localeCompare(b.serviceType);
            } else if (sortBy === 'date') {
                comparison = new Date(a.date) - new Date(b.date);
            }
            return order === 'asc' ? comparison : -comparison;
        });

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to view this appointment
        if (!req.user.isAdmin && appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to view this appointment' });
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: 'Failed to fetch appointment' });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        console.log('Creating appointment with data:', req.body);
        console.log('User from auth middleware:', req.user);
        
        const { petOwner, petName, serviceType, trainingType, date, time, notes, amount } = req.body;
        
        // Set default amount based on service type if not provided
        let appointmentAmount = amount;
        if (!appointmentAmount) {
            switch (serviceType) {
                case 'Vet Service':
                    appointmentAmount = 5000;
                    break;
                case 'Pet Grooming':
                    appointmentAmount = 4500;
                    break;
                case 'Pet Training':
                    appointmentAmount = trainingType === 'Private' ? 7500 : 3500;
                    break;
                default:
                    appointmentAmount = 0;
            }
        }
        
        console.log('Extracted data:', {
            petOwner,
            petName,
            serviceType,
            trainingType,
            date,
            time,
            notes,
            amount: appointmentAmount,
            userId: req.user._id
        });
        
        const newAppointment = new Appointment({
            petOwner,
            petName,
            serviceType,
            trainingType: trainingType || 'N/A',
            date,
            time,
            notes,
            amount: appointmentAmount,
            status: 'Pending',
            userId: req.user._id
        });
        
        console.log('Created appointment object:', newAppointment);
        
        await newAppointment.save();
        console.log('Appointment saved successfully');
        
        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Failed to book appointment', error: error.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { petName, date, time, notes, serviceType, trainingType, amount, status } = req.body;
        
        // First check if the appointment exists and if the user has permission to update it
        const existingAppointment = await Appointment.findById(req.params.id);
        if (!existingAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to update this appointment
        if (!req.user.isAdmin && existingAppointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this appointment' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { petName, date, time, notes, serviceType, trainingType, amount, status },
            { new: true }
        );

        res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Failed to update appointment' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        // First check if the appointment exists and if the user has permission to delete it
        const existingAppointment = await Appointment.findById(req.params.id);
        if (!existingAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user has permission to delete this appointment
        if (!req.user.isAdmin && existingAppointment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this appointment' });
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Failed to delete appointment' });
    }
};