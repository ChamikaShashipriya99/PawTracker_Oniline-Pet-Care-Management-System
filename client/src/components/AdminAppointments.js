// client/src/AdminAppointments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Notification from '../components/Notification';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000'; // Updated to port 5000

function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointment');
            setAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setNotification({ message: 'Error: Could not fetch appointments.', type: 'error' });
            setLoading(false);
        }
    };

    const handleApproveAppointment = async (id) => {
        try {
            await axios.put(`/api/appointment/${id}`, { status: 'Approved' });
            setNotification({ message: 'Appointment approved successfully.', type: 'success' });
            fetchAppointments();
        } catch (error) {
            console.error('Error approving appointment:', error);
            setNotification({ message: 'Error: Could not approve appointment.', type: 'error' });
        }
    };

    const handleRejectAppointment = async (id) => {
        try {
            await axios.put(`/api/appointment/${id}`, { status: 'Rejected' });
            setNotification({ message: 'Appointment rejected successfully.', type: 'success' });
            fetchAppointments();
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            setNotification({ message: 'Error: Could not reject appointment.', type: 'error' });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const downloadSinglePDF = (appointment) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(76, 175, 80); // Green background
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('Paw-Tracker Appointment', 20, 13);

        // Reset for content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        // Content
        const startY = 30;
        doc.setFont('helvetica', 'bold');
        doc.text('Pet Owner:', 20, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.petOwner, 50, startY);

        doc.setFont('helvetica', 'bold');
        doc.text('Pet Name:', 20, startY + 10);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.petName, 50, startY + 10);

        doc.setFont('helvetica', 'bold');
        doc.text('Service:', 20, startY + 20);
        doc.setFont('helvetica', 'normal');
        doc.text(`${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`, 50, startY + 20);

        doc.setFont('helvetica', 'bold');
        doc.text('Date & Time:', 20, startY + 30);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formatDate(appointment.date)} at ${appointment.time}`, 50, startY + 30);

        doc.setFont('helvetica', 'bold');
        doc.text('Amount:', 20, startY + 40);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rs.${appointment.amount}`, 50, startY + 40);

        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 20, startY + 50);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.status, 50, startY + 50);

        if (appointment.notes) {
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', 20, startY + 60);
            doc.setFont('helvetica', 'normal');
            doc.text(appointment.notes, 50, startY + 60, { maxWidth: 140 });
        }

        // Separator Line
        doc.setLineWidth(0.5);
        doc.setDrawColor(76, 175, 80);
        doc.line(20, startY + (appointment.notes ? 80 : 60), 190, startY + (appointment.notes ? 80 : 60));

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);

        doc.save(`appointment_${appointment._id}.pdf`);
    };

    const downloadAllPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(76, 175, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('Paw-Tracker All Appointments', 20, 13);

        // Reset for content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        let y = 30;
        appointments.forEach((appointment, index) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`#${index + 1} - ${appointment.petOwner}`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`Service: ${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`, 30, y + 10);
            doc.text(`Date: ${formatDate(appointment.date)} at ${appointment.time}`, 30, y + 15);
            doc.text(`Status: ${appointment.status} | Amount: Rs.${appointment.amount}`, 30, y + 20);
            y += 35;
            if (y > 250) { // Add new page if needed
                doc.addPage();
                doc.setFillColor(76, 175, 80);
                doc.rect(0, 0, 210, 20, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text('Paw-Tracker All Appointments (Cont.)', 20, 13);
                doc.setTextColor(0, 0, 0);
                y = 30;
            }
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);

        doc.save('all_appointments.pdf');
    };

    return (
        <div className="service-container">
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Admin: Manage Appointments 🐾</h1>
                    <p className="hero-subtitle">Review and manage all pet care appointments.</p>
                </div>
            </section>

            {notification.message && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: 'success' })}
                />
            )}
            {loading ? (
                <p className="text-center py-5 fade-in">Loading appointments...</p>
            ) : (
                <section className="content-section fade-in">
                    <div className="container">
                        {appointments.length === 0 ? (
                            <p className="text-center py-5">No appointments found.</p>
                        ) : (
                            <div className="appointments-list">
                                <div className="appointment-count text-center py-3" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
                                    Total Appointments: {appointments.length}
                                </div>
                                <div className="text-center mb-4">
                                    <button className="hero-btn download-all-button" onClick={downloadAllPDF}>
                                        Download All as PDF
                                    </button>
                                </div>
                                <div className="card hover-card">
                                    <div className="card-body">
                                        <table className="appointments-table">
                                            <thead>
                                                <tr>
                                                    <th>Pet Owner</th>
                                                    <th>Pet Name</th>
                                                    <th>Service</th>
                                                    <th>Date & Time</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.map((appointment) => (
                                                    <tr key={appointment._id} className="appointment-row">
                                                        <td>{appointment.petOwner}</td>
                                                        <td>{appointment.petName}</td>
                                                        <td>
                                                            {appointment.serviceType}
                                                            {appointment.trainingType !== 'N/A' && ` (${appointment.trainingType})`}
                                                        </td>
                                                        <td>{formatDate(appointment.date)} at {appointment.time}</td>
                                                        <td>Rs.{appointment.amount}</td>
                                                        <td className={`status-${appointment.status.toLowerCase()}`}>
                                                            {appointment.status}
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                {appointment.status === 'Pending' && (
                                                                    <>
                                                                        <button
                                                                            className="hero-btn approve-button"
                                                                            onClick={() => handleApproveAppointment(appointment._id)}
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            className="hero-btn reject-button"
                                                                            onClick={() => handleRejectAppointment(appointment._id)}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    className="hero-btn download-button"
                                                                    onClick={() => downloadSinglePDF(appointment)}
                                                                >
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
                    </div>
                </section>
            )}
        </div>
    );
}

export default AdminAppointments;