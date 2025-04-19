// client/src/MyAppointments.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import Notification from '../components/Notification';
import './Service.css'; // Use Service.css instead of appointment.css

function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.notification) {
            setNotification(location.state.notification);
        }
        fetchAppointments();
    }, [location]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointment');
            setAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setNotification('Error: Could not fetch appointments.');
            setLoading(false);
        }
    };

    const handleViewAppointment = (id) => navigate(`/appointment/${id}`);
    const handleEditAppointment = (id) => navigate(`/edit-appointment/${id}`);
    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await axios.delete(`/api/appointment/${id}`);
                setNotification('Appointment cancelled successfully.');
                fetchAppointments();
            } catch (error) {
                console.error('Error deleting appointment:', error);
                setNotification('Error: Could not cancel appointment.');
            }
        }
    };

    const handleProceedToPay = (appointment) => {
        console.log(`Proceeding to pay for appointment ${appointment._id} - Amount: Rs.${appointment.amount}`);
        alert(`Proceed to pay Rs.${appointment.amount} for ${appointment.serviceType}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const downloadPDF = (appointment) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(76, 175, 80); // Green background
        doc.rect(0, 0, 210, 20, 'F'); // Full-width header
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255); // White text
        doc.text('Paw-Tracker Appointment', 20, 13);

        // Reset for content
        doc.setTextColor(0, 0, 0); // Black text
        doc.setFontSize(12);

        // Content
        const startY = 30;
        doc.setFont('helvetica', 'bold');
        doc.text('Service:', 20, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(`${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`, 50, startY);

        doc.setFont('helvetica', 'bold');
        doc.text('Date & Time:', 20, startY + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formatDate(appointment.date)} at ${appointment.time}`, 50, startY + 10);

        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 20, startY + 20);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.status, 50, startY + 20);

        doc.setFont('helvetica', 'bold');
        doc.text('Amount:', 20, startY + 30);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rs.${appointment.amount}`, 50, startY + 30);

        doc.setFont('helvetica', 'bold');
        doc.text('Pet Owner:', 20, startY + 40);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.petOwner, 50, startY + 40);

        doc.setFont('helvetica', 'bold');
        doc.text('Pet Name:', 20, startY + 50);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.petName, 50, startY + 50);

        if (appointment.notes) {
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', 20, startY + 60);
            doc.setFont('helvetica', 'normal');
            doc.text(appointment.notes, 50, startY + 60, { maxWidth: 140 }); // Wrap long notes
        }

        // Separator Line
        doc.setLineWidth(0.5);
        doc.setDrawColor(76, 175, 80); // Green line
        doc.line(20, startY + (appointment.notes ? 80 : 60), 190, startY + (appointment.notes ? 80 : 60));

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Gray text
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);

        doc.save(`appointment_${appointment._id}.pdf`);
    };

    return (
        <div className="service-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">My Appointments 🐾</h1>
                    <p className="hero-subtitle">Manage and track all your pet care appointments here.</p>
                </div>
            </section>

            {notification && <Notification message={notification} onClose={() => setNotification('')} />}
            {loading ? (
                <p className="text-center py-5 fade-in">Loading appointments...</p>
            ) : (
                <>
                    <div className="appointment-count text-center py-3 fade-in" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
                        Total Appointments: {appointments.length}
                    </div>
                    {appointments.length === 0 ? (
                        <p className="text-center py-5 fade-in">You don't have any appointments yet.</p>
                    ) : (
                        <div className="appointments-list container py-5">
                            <div className="card hover-card">
                                <div className="card-body">
                                    <table className="appointments-table">
                                        <thead>
                                            <tr>
                                                <th>Service</th>
                                                <th>Date & Time</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((appointment) => (
                                                <tr key={appointment._id} className="appointment-row">
                                                    <td>
                                                        {appointment.serviceType}
                                                        {appointment.trainingType !== 'N/A' && ` (${appointment.trainingType})`}
                                                    </td>
                                                    <td>{formatDate(appointment.date)} at {appointment.time}</td>
                                                    <td className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</td>
                                                    <td>Rs.{appointment.amount}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="hero-btn view-button" onClick={() => handleViewAppointment(appointment._id)}>
                                                                View
                                                            </button>
                                                            {appointment.status === 'Pending' && (
                                                                <>
                                                                    <button className="hero-btn edit-button" onClick={() => handleEditAppointment(appointment._id)}>
                                                                        Edit
                                                                    </button>
                                                                    <button className="hero-btn delete-button" onClick={() => handleDeleteAppointment(appointment._id)}>
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {appointment.status === 'Approved' && (
                                                                <button className="hero-btn pay-button" onClick={() => handleProceedToPay(appointment)}>
                                                                    Proceed to Pay
                                                                </button>
                                                            )}
                                                            <button className="hero-btn download-button" onClick={() => downloadPDF(appointment)}>
                                                                Download PDF
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MyAppointments;