// client/src/EditAppointment.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/Notification';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000'; // Updated to port 5000

function EditAppointment() {
    const [formData, setFormData] = useState({
        petName: '',
        date: '',
        time: '',
        notes: ''
    });
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const response = await axios.get(`/api/appointment/${id}`);
                const appointmentData = response.data;

                if (!appointmentData) {
                    throw new Error('No appointment data returned');
                }

                const formattedDate = new Date(appointmentData.date).toISOString().split('T')[0];
                setFormData({
                    petName: appointmentData.petName,
                    date: formattedDate,
                    time: appointmentData.time,
                    notes: appointmentData.notes || ''
                });
                setOriginalData({
                    serviceType: appointmentData.serviceType,
                    trainingType: appointmentData.trainingType || 'N/A',
                    amount: appointmentData.amount
                });
                setAmount(appointmentData.amount);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching appointment:', error);
                setError(error.response?.data?.message || 'Failed to fetch appointment');
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!formData.petName.trim()) {
            newErrors.petName = 'Pet name is required';
        } else if (formData.petName.length < 2) {
            newErrors.petName = 'Pet name must be at least 2 characters';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        } else if (formData.date < today) {
            newErrors.date = 'Date cannot be in the past';
        }

        if (!formData.time) {
            newErrors.time = 'Please select a time';
        } else {
            const [hours, minutes] = formData.time.split(':').map(Number);
            if (hours < 9 || hours >= 17) {
                newErrors.time = 'Time must be between 9:00 AM and 5:00 PM';
            }
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const updatedAppointment = {
                ...formData,
                serviceType: originalData.serviceType,
                trainingType: originalData.trainingType,
                amount: originalData.amount
            };

            const response = await axios.put(`/api/appointment/${id}`, updatedAppointment);
            navigate('/my-appointments', {
                state: { notification: response.data.message || 'Appointment updated successfully!' }
            });
        } catch (error) {
            console.error('Error updating appointment:', error);
            navigate('/my-appointments', {
                state: { notification: 'Failed to update appointment: ' + (error.response?.data?.message || error.message) }
            });
        }
    };

    const handleCancel = () => {
        navigate('/my-appointments');
    };

    if (loading) {
        return (
            <div className="service-container">
                <section className="hero-section">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">Edit Appointment 🐾</h1>
                        <p className="hero-subtitle">Modify your pet's appointment details.</p>
                    </div>
                </section>
                <p className="text-center py-5 fade-in">Loading appointment details...</p>
            </div>
        );
    }

    if (error || !originalData) {
        return (
            <div className="service-container">
                <section className="hero-section">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">Edit Appointment 🐾</h1>
                        <p className="hero-subtitle">Modify your pet's appointment details.</p>
                    </div>
                </section>
                <div className="container py-5">
                    <Notification message={error || 'Appointment not found.'} onClose={() => setError(null)} />
                    <div className="text-center fade-in">
                        <button className="hero-btn cancel-button" onClick={handleCancel}>
                            Back to My Appointments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="service-container">
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Edit Appointment 🐾</h1>
                    <p className="hero-subtitle">Modify your pet's appointment details.</p>
                </div>
            </section>

            <section className="content-section fade-in">
                <div className="container">
                    <div className="card hover-card">
                        <div className="card-body">
                            <form className="appointment-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Service Type</label>
                                    <p className="service-info">Service: {originalData.serviceType}</p>
                                    {originalData.trainingType !== 'N/A' && (
                                        <p className="service-info">Training Type: {originalData.trainingType}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="petName">Pet's Name</label>
                                    <input
                                        type="text"
                                        id="petName"
                                        name="petName"
                                        className="form-control"
                                        value={formData.petName}
                                        onChange={handleChange}
                                    />
                                    {validationErrors.petName && (
                                        <span className="error">{validationErrors.petName}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="date">Preferred Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        className="form-control"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                    {validationErrors.date && (
                                        <span className="error">{validationErrors.date}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="time">Preferred Time</label>
                                    <input
                                        type="time"
                                        id="time"
                                        name="time"
                                        className="form-control"
                                        value={formData.time}
                                        onChange={handleChange}
                                    />
                                    {validationErrors.time && (
                                        <span className="error">{validationErrors.time}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Additional Notes</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        className="form-control"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="amount-display">
                                    Total Amount: Rs.{amount}
                                </div>

                                <div className="action-buttons">
                                    <button type="submit" className="hero-btn submit-button">
                                        Update Appointment
                                    </button>
                                    <button
                                        type="button"
                                        className="hero-btn cancel-button"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default EditAppointment;