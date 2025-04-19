// client/src/BookAppointment.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000'; // Updated to port 5000

function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const initialServiceType = queryParams.get('service') || '';
    const initialTrainingType = queryParams.get('type') || 'N/A';

    const [formData, setFormData] = useState({
        petOwner: '',
        petName: '',
        serviceType: initialServiceType,
        trainingType: initialTrainingType,
        date: '',
        time: '',
        notes: ''
    });
    const [amount, setAmount] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        calculateAmount(formData.serviceType, formData.trainingType);
    }, [formData.serviceType, formData.trainingType]);

    const calculateAmount = (service, trainingType) => {
        let calculatedAmount = 0;
        switch (service) {
            case 'Vet Service':
                calculatedAmount = 5000;
                break;
            case 'Pet Grooming':
                calculatedAmount = 4500;
                break;
            case 'Pet Training':
                calculatedAmount = trainingType === 'Private' ? 7500 : 3500;
                break;
            default:
                calculatedAmount = 0;
        }
        setAmount(calculatedAmount);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'serviceType' && value !== 'Pet Training' ? { trainingType: 'N/A' } : {})
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!formData.petOwner.trim()) {
            newErrors.petOwner = 'Pet owner name is required';
        } else if (formData.petOwner.length < 2) {
            newErrors.petOwner = 'Pet owner name must be at least 2 characters';
        }

        if (!formData.petName.trim()) {
            newErrors.petName = 'Pet name is required';
        } else if (formData.petName.length < 2) {
            newErrors.petName = 'Pet name must be at least 2 characters';
        }

        if (!formData.serviceType) {
            newErrors.serviceType = 'Please select a service';
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formattedDate = new Date(formData.date).toISOString();

            const appointmentData = {
                ...formData,
                date: formattedDate,
                amount: Number(amount)
            };

            console.log('Sending data:', appointmentData);

            const response = await axios.post('/api/appointment', appointmentData);
            console.log('Response:', response.data);

            if (response.data && response.status === 201) {
                setFormData({
                    petOwner: '',
                    petName: '',
                    serviceType: '',
                    trainingType: 'N/A',
                    date: '',
                    time: '',
                    notes: ''
                });
                alert('Appointment booked successfully!');
                navigate('/my-appointments');
            } else {
                throw new Error('Failed to book appointment');
            }
        } catch (error) {
            console.error('Error details:', error);
            alert('Failed to book appointment: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="service-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Book an Appointment 🐾</h1>
                    <p className="hero-subtitle">Schedule a service for your pet with ease.</p>
                </div>
            </section>

            <section className="content-section fade-in">
                <div className="container">
                    <div className="card hover-card">
                        <div className="card-body">
                            <form className="appointment-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="petOwner">Your Name</label>
                                    <input
                                        type="text"
                                        id="petOwner"
                                        name="petOwner"
                                        className="form-control"
                                        value={formData.petOwner}
                                        onChange={handleChange}
                                    />
                                    {errors.petOwner && <span className="error">{errors.petOwner}</span>}
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
                                    {errors.petName && <span className="error">{errors.petName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="serviceType">Service Type</label>
                                    <select
                                        id="serviceType"
                                        name="serviceType"
                                        className="form-select"
                                        value={formData.serviceType}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a service</option>
                                        <option value="Vet Service">Veterinary Services</option>
                                        <option value="Pet Grooming">Pet Grooming</option>
                                        <option value="Pet Training">Pet Training</option>
                                    </select>
                                    {errors.serviceType && <span className="error">{errors.serviceType}</span>}
                                </div>

                                {formData.serviceType === 'Pet Training' && (
                                    <div className="form-group service-options">
                                        <label htmlFor="trainingType">Training Type</label>
                                        <select
                                            id="trainingType"
                                            name="trainingType"
                                            className="form-select"
                                            value={formData.trainingType}
                                            onChange={handleChange}
                                        >
                                            <option value="Private">Private Training (Rs.7500)</option>
                                            <option value="Group">Group Training (Rs.3500)</option>
                                        </select>
                                    </div>
                                )}

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
                                    {errors.date && <span className="error">{errors.date}</span>}
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
                                    {errors.time && <span className="error">{errors.time}</span>}
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

                                <div className="amount-display">Total Amount: Rs.{amount}</div>
                                <button type="submit" className="hero-btn submit-button">Confirm Appointment</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default BookAppointment;