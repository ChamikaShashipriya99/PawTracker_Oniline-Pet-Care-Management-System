import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000';

function BookAppointment() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const initialServiceType = queryParams.get('service') || '';
    const initialTrainingType = queryParams.get('type') || 'N/A';

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user ? `${user.firstName} ${user.lastName}` : '';

    const [formData, setFormData] = useState({
        petOwner: userName,
        petName: '',
        serviceType: initialServiceType,
        trainingType: initialServiceType === 'Pet Training' ? (initialTrainingType || 'Private') : 'N/A',
        date: '',
        time: '',
        notes: '',
        amount: 0
    });

    // Calculate initial amount when component mounts or initial values change
    useEffect(() => {
        if (initialServiceType) {
            const trainingType = initialServiceType === 'Pet Training' ? (initialTrainingType || 'Private') : 'N/A';
            const calculatedAmount = calculateAmount(initialServiceType, trainingType);
            setFormData(prev => ({
                ...prev,
                amount: calculatedAmount,
                trainingType: trainingType
            }));
        }
    }, [initialServiceType, initialTrainingType]);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ message: '', type: '' });

    const calculateAmount = (serviceType, trainingType = 'N/A') => {
        console.log('Calculating amount for:', { serviceType, trainingType });
        switch (serviceType) {
            case 'Vet Service':
                return 5000;
            case 'Pet Grooming':
                return 4500;
            case 'Pet Training':
                // Check for exact string match
                if (trainingType === 'Private') {
                    return 7500;
                } else if (trainingType === 'Group') {
                    return 3500;
                }
                // Default to private training amount if training type is not set
                return 7500;
            default:
                return 0;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        const updatedFormData = {
            ...formData,
            [name]: value,
            ...(name === 'serviceType' && value !== 'Pet Training' ? { trainingType: 'N/A' } : {})
        };

        // Recalculate amount when service type or training type changes
        if (name === 'serviceType' || name === 'trainingType') {
            updatedFormData.amount = calculateAmount(
                name === 'serviceType' ? value : formData.serviceType,
                name === 'trainingType' ? value : formData.trainingType
            );
        }

        setFormData(updatedFormData);
        setErrors(prev => ({ ...prev, [name]: '' }));
        setNotification({ message: '', type: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        const today = new Date().toISOString().split('T')[0];

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
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrors({ submit: 'Please login to book an appointment' });
                return;
            }

            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user ? user._id : null;

            const appointmentData = {
                ...formData,
                userId: userId
            };

            const response = await axios.post('/api/appointments', appointmentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setNotification({ message: 'Appointment booked successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/my-appointments');
            }, 2000);
        } catch (error) {
            console.error('Error booking appointment:', error);
            setNotification({ 
                message: error.response?.data?.message || 'Failed to book appointment', 
                type: 'error' 
            });
        }
    };

    // Generate time slots from 09:00 to 16:30
    const generateTimeSlots = (start = 9, end = 17) => {
        const slots = [];
        for (let hour = start; hour < end; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };
    const timeSlots = generateTimeSlots();

    return (
        <div className="service-container">
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Book an Appointment 🐾</h1>
                    <p className="hero-subtitle">Schedule a visit for your furry friend.</p>
                </div>
            </section>

            <section className="content-section fade-in">
                <div className="container">
                    <div className="card hover-card">
                        <div className="card-body">
                            {notification.message && (
                                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
                                    {notification.message}
                                </div>
                            )}
                            <form className="appointment-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="petOwner">Your Name</label>
                                    <input
                                        type="text"
                                        id="petOwner"
                                        name="petOwner"
                                        className="form-control"
                                        value={formData.petOwner}
                                        readOnly
                                        disabled
                                    />
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
                                            <option value="Private">Private Training</option>
                                            <option value="Group">Group Training</option>
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
                                    <select
                                        id="time"
                                        name="time"
                                        className="form-select"
                                        value={formData.time}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a time</option>
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
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

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginTop: '20px',
                                    flexWrap: 'wrap'
                                }}>
                                    {formData.amount > 0 && (
                                        <div style={{
                                            padding: '10px 15px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '5px',
                                            border: '1px solid #dee2e6',
                                            fontSize: '1.1em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>Service Charge:</span>
                                            <span style={{ 
                                                color: '#28a745',
                                                fontWeight: 'bold',
                                                fontSize: '1.2em'
                                            }}>
                                                Rs. {formData.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <button 
                                        type="submit" 
                                        className="hero-btn submit-button"
                                        style={{ margin: 0 }}
                                    >
                                        Confirm Appointment
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

export default BookAppointment;