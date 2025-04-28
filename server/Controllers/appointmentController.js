const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
    try {
        const { serviceType, sortBy = 'date', order = 'asc' } = req.query;
        let query = {};

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
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: 'Failed to fetch appointment' });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { petOwner, petName, serviceType, trainingType, date, time, notes, amount } = req.body;
        const newAppointment = new Appointment({
            petOwner,
            petName,
            serviceType,
            trainingType: trainingType || 'N/A',
            date,
            time,
            notes,
            amount,
            status: 'Pending'
        });
        await newAppointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Failed to book appointment' });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { petName, date, time, notes, serviceType, trainingType, amount, status } = req.body;
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { petName, date, time, notes, serviceType, trainingType, amount, status },
            { new: true }
        );
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Failed to update appointment' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Failed to delete appointment' });
    }
};