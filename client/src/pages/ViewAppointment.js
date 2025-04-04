import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/appointment.css';

function ViewAppointment() {
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/appointment/${id}`);
                if (!response.data) {
                    throw new Error('No appointment data returned');
                }
                setAppointment(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching appointment:', err);
                setError(err.response?.data?.message || 'Failed to fetch appointment details');
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleBack = () => {
        navigate('/my-appointments');
    };

    if (loading) {
        return <div className="appointment-container">Loading appointment details...</div>;
    }

    if (error || !appointment) {
        return (
            <div className="appointment-container">
                <div className="notification notification-error">{error || 'Appointment not found'}</div>
                <button className="back-button" onClick={handleBack}>Back to My Appointments</button>
            </div>
        );
    }

    return (
        <div className="appointment-container">
            <div className="appointment-header">
                <h1>View Appointment</h1>
            </div>
            <div className="appointment-card">
                <div className="card-header">
                    <h2>{appointment.serviceType} {appointment.trainingType !== 'N/A' && `(${appointment.trainingType})`}</h2>
                </div>
                <div className="card-content">
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
                        <span className={`detail-value status-${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value">Rs.{appointment.amount}</span>
                    </div>
                    {appointment.notes && (
                        <div className="detail-item">
                            <span className="detail-label">Notes:</span>
                            <span className="detail-value">{appointment.notes}</span>
                        </div>
                    )}
                </div>
                <div className="card-footer">
                    <button className="back-button" onClick={handleBack}>Back to My Appointments</button>
                </div>
            </div>
        </div>
    );
}

export default ViewAppointment;