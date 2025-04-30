import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/Notification';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000';

function ViewAppointment() {
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchAppointment();
    }, [id]);

    const fetchAppointment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/appointments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.data) {
                throw new Error('No appointment data returned');
            }
            console.log('Fetched appointment:', response.data);
            console.log('Appointment amount:', response.data.amount);
            setAppointment(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching appointment:', err);
            setError(err.response?.data?.message || 'Failed to fetch appointment details');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleBack = () => {
        navigate('/my-appointments');
    };

    if (loading) {
        return (
            <div className="service-container">
                <section className="hero-section">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">View Appointment 🐾</h1>
                        {user && (
                            <button
                                className="btn btn-secondary mb-3"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    setUser(null);
                                    navigate('/login');
                                }}
                            >
                                Logout
                            </button>
                        )}
                        {user ? (
                            <div className="profile-photo-container">
                                <img
                                    src={user.profilePhoto ? `${axios.defaults.baseURL}${user.profilePhoto}` : 'https://placehold.co/100x100?text=Profile'}
                                    alt="Profile"
                                    className="profile-photo"
                                    onError={(e) => {
                                        if (e.target.src !== 'https://placehold.co/100x100?text=Profile') {
                                            e.target.src = 'https://placehold.co/100x100?text=Profile';
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="hero-subtitle">See the details of your pet's appointment.</p>
                        )}
                    </div>
                </section>
                <p className="text-center py-5 fade-in">Loading appointment details...</p>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="service-container">
                <section className="hero-section">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">View Appointment 🐾</h1>
                        {user && (
                            <button
                                className="btn btn-secondary mb-3"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    setUser(null);
                                    navigate('/login');
                                }}
                            >
                                Logout
                            </button>
                        )}
                        {user ? (
                            <div className="profile-photo-container">
                                <img
                                    src={user.profilePhoto ? `${axios.defaults.baseURL}${user.profilePhoto}` : 'https://placehold.co/100x100?text=Profile'}
                                    alt="Profile"
                                    className="profile-photo"
                                    onError={(e) => {
                                        if (e.target.src !== 'https://placehold.co/100x100?text=Profile') {
                                            e.target.src = 'https://placehold.co/100x100?text=Profile';
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="hero-subtitle">See the details of your pet's appointment.</p>
                        )}
                    </div>
                </section>
                <div className="container py-5">
                    <Notification message={error || 'Appointment not found.'} onClose={() => setError(null)} />
                    <div className="text-center fade-in">
                        <button className="hero-btn back-button" onClick={handleBack}>
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
                    <h1 className="hero-title">View Appointment 🐾</h1>
                </div>
            </section>

            <section className="content-section fade-in">
                <div className="container">
                    <div className="card hover-card">
                        <div className="card-header">
                            <h2 className="card-title">
                                {appointment.serviceType} {appointment.trainingType !== 'N/A' && `(${appointment.trainingType})`}
                            </h2>
                        </div>
                        <div className="card-body">
                            <div className="detail-item">
                                <span className="detail-label">Pet Owner:</span>
                                <span className="detail-value">{appointment.petOwner}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Pet Name:</span>
                                <span className="detail-value">{appointment.petName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Date & Time:</span>
                                <span className="detail-value">{formatDate(appointment.date)} at {appointment.time}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className={`detail-value status-${appointment.status.toLowerCase()}`}>
                                    {appointment.status}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Amount:</span>
                                <span className="detail-value">Rs.{appointment.amount ?? 'N/A'}</span>
                            </div>
                            {appointment.notes && (
                                <div className="detail-item">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{appointment.notes}</span>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <button className="hero-btn back-button" onClick={handleBack}>
                                Back to My Appointments
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ViewAppointment;