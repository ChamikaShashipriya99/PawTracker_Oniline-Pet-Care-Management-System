import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Added import for table support
import Notification from '../components/Notification';
import './Service.css';

axios.defaults.baseURL = 'http://localhost:5000';

function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const [error, setError] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
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
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/appointments/my-appointments', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Fetched appointments:', response.data);
            response.data.forEach(appointment => {
                console.log(`Appointment ${appointment._id} amount:`, appointment.amount);
            });
            setAppointments(response.data);
            setFilteredAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError(error.response?.data?.message || 'Failed to fetch appointments');
            setLoading(false);
        }
    };

    useEffect(() => {
        let updatedAppointments = [...appointments];

        if (serviceFilter) {
            updatedAppointments = updatedAppointments.filter(
                appointment => appointment.serviceType === serviceFilter
            );
        }

        if (statusFilter) {
            updatedAppointments = updatedAppointments.filter(
                appointment => appointment.status === statusFilter
            );
        }

        if (searchQuery) {
            updatedAppointments = updatedAppointments.filter(
                appointment =>
                    appointment.petOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    appointment.petName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        updatedAppointments.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'serviceType') {
                comparison = a.serviceType.localeCompare(b.serviceType);
            } else if (sortBy === 'date') {
                comparison = new Date(a.date) - new Date(b.date);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredAppointments(updatedAppointments);
    }, [appointments, serviceFilter, statusFilter, searchQuery, sortBy, sortOrder]);

    const handleViewAppointment = (id) => navigate(`/view-appointment/${id}`);
    const handleEditAppointment = (id) => navigate(`/edit-appointment/${id}`);
    
    const handleProceedToPay = (appointmentId) => {
        // You can implement payment processing logic here
        // For now, we'll just show an alert
        alert(`Proceeding to payment for appointment ${appointmentId}`);
        // In a real implementation, you would navigate to a payment page or open a payment modal
        // navigate(`/payment/${appointmentId}`);
    };
    
    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/appointments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setNotification('Appointment cancelled successfully.');
                fetchAppointments();
            } catch (error) {
                console.error('Error deleting appointment:', error);
                setNotification('Error: Could not cancel appointment.');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const downloadPDF = (appointment) => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(255, 87, 51); // Orange #ff5733
        doc.text('Paw-Tracker Appointment', 105, 20, { align: 'center' });

        // Subtitle
        doc.setFontSize(12);
        doc.setTextColor(85, 85, 85); // Gray #555
        doc.text('Appointment Details', 105, 30, { align: 'center' });

        // Table
        const tableData = [
            ['Service', `${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`],
            ['Date & Time', `${formatDate(appointment.date)} at ${appointment.time}`],
            ['Amount', `Rs. ${appointment.amount || 'N/A'}`],
            ['Status', appointment.status],
            ['Pet Owner', appointment.petOwner],
            ['Pet Name', appointment.petName],
            ['Notes', appointment.notes || 'N/A']
        ];

        autoTable(doc, {
            startY: 40,
            head: [['Detail', 'Information']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] }, // Orange header
            alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray #F9FAFB
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(85, 85, 85); // Gray #555
        doc.text(
            'Generated by Online Pet Care System',
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );

        doc.save(`appointment_${appointment._id}.pdf`);
    };

    const handleResetFilters = () => {
        setServiceFilter('');
        setStatusFilter('');
        setSearchQuery('');
        setSortBy('date');
        setSortOrder('asc');
    };

    return (
        <div className="service-container">
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">My Appointments 🐾</h1>
                    <p className="hero-subtitle">Manage and track all your pet care appointments here.</p>
                </div>
            </section>
            <br></br>

            {notification && <Notification message={notification} onClose={() => setNotification('')} />}
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <p className="text-center py-5 fade-in">Loading appointments...</p>
            ) : (
                <>
                    <div className="container py-3">
                        <div className="row mb-3">
                            <div className="col-md-3">
                                <label htmlFor="serviceFilter" className="form-label">Filter by Service:</label>
                                <select
                                    id="serviceFilter"
                                    className="form-select"
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                >
                                    <option value="">All Services</option>
                                    <option value="Vet Service">Vet Service</option>
                                    <option value="Pet Training">Pet Training</option>
                                    <option value="Pet Grooming">Pet Grooming</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="statusFilter" className="form-label">Filter by Status:</label>
                                <select
                                    id="statusFilter"
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="searchQuery" className="form-label">Search by Owner or Pet:</label>
                                <input
                                    id="searchQuery"
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label htmlFor="sortBy" className="form-label">Sort By:</label>
                                <select
                                    id="sortBy"
                                    className="form-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="date">Date</option>
                                    <option value="serviceType">Service Type</option>
                                </select>
                            </div>
                            <div className="col-md-1">
                                <label htmlFor="sortOrder" className="form-label">Order:</label>
                                <select
                                    id="sortOrder"
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="asc">Asc</option>
                                    <option value="desc">Desc</option>
                                </select>
                                <br></br>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-secondary w-100" onClick={handleResetFilters}>
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="appointment-count text-center py-3 fade-in" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>
                        Total Appointments: {filteredAppointments.length}
                    </div>
                    {filteredAppointments.length === 0 ? (
                        <p className="text-center py-5 fade-in">No appointments match your filters.</p>
                    ) : (
                        <div className="appointments-list container py-5">
                            <div className="card hover-card">
                                <div className="card-body">
                                    <table className="appointments-table">
                                        <thead>
                                            <tr>
                                                <th>Service</th>
                                                <th>Pet Owner</th>
                                                <th>Pet Name</th>
                                                <th>Date & Time</th>
                                                <th>Amount (Rs.)</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppointments.map((appointment) => (
                                                <tr key={appointment._id} className="appointment-row">
                                                    <td>
                                                        {appointment.serviceType}
                                                        {appointment.trainingType !== 'N/A' && ` (${appointment.trainingType})`}
                                                    </td>
                                                    <td>{appointment.petOwner}</td>
                                                    <td>{appointment.petName}</td>
                                                    <td>{formatDate(appointment.date)} at {appointment.time}</td>
                                                    <td>{appointment.amount || 'N/A'}</td>
                                                    <td className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</td>
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
                                                                <button 
                                                                    className="hero-btn pay-button" 
                                                                    onClick={() => handleProceedToPay(appointment._id)}
                                                                    style={{ backgroundColor: '#4CAF50' }}
                                                                >
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