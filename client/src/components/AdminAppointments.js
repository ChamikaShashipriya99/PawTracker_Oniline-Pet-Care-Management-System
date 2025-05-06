import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Service.css';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5000';

function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [notification, setNotification] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.get('http://localhost:5000/api/appointments/all', config);
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

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.patch(
                `http://localhost:5000/api/appointments/${appointmentId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update the appointments list with the new status
            setAppointments(appointments.map(appointment => 
                appointment._id === appointmentId 
                    ? { ...appointment, status: newStatus } 
                    : appointment
            ));

            // Show success message
            setNotification({
                message: `Appointment status updated to ${newStatus}`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating appointment status:', error);
            setError(error.response?.data?.message || 'Failed to update appointment status');
        }
    };

    const handleReopen = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in again.');
                return;
            }

            const response = await axios.patch(
                `http://localhost:5000/api/appointments/${id}/status`,
                { status: 'Pending' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update the appointments list with the new status
            setAppointments(appointments.map(appointment => 
                appointment._id === id 
                    ? { ...appointment, status: 'Pending' } 
                    : appointment
            ));

            // Show success message
            setNotification({
                message: 'Appointment reopened successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error reopening appointment:', error);
            setError(error.response?.data?.message || 'Failed to reopen appointment');
        }
    };

    const isFinalStatus = (status) => {
        return ['Approved', 'Rejected', 'Completed'].includes(status);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const downloadPDF = (appointment) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(255, 87, 51);
        doc.text('Paw-Tracker Appointment', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(85, 85, 85);
        doc.text('Appointment Details', 105, 30, { align: 'center' });

        const tableData = [[
            `${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`,
            `${formatDate(appointment.date)} at ${appointment.time}`,
            appointment.status,
            `Rs.${appointment.amount || 'N/A'}`,
            appointment.petOwner,
            appointment.petName,
            appointment.notes || 'N/A'
        ]];

        autoTable(doc, {
            startY: 40,
            head: [['Service', 'Date & Time', 'Status', 'Amount', 'Pet Owner', 'Pet Name', 'Notes']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        doc.setFontSize(8);
        doc.setTextColor(85, 85, 85);
        doc.text(
            'Generated by Online Pet Care System',
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );

        doc.save(`appointment_${appointment._id}.pdf`);
    };

    const downloadAllPDFs = () => {
        if (filteredAppointments.length === 0) {
            alert('No appointments to download.');
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(255, 87, 51);
        doc.text('Paw-Tracker Appointments Report', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(85, 85, 85);
        doc.text(`Total Appointments: ${filteredAppointments.length}`, 105, 30, { align: 'center' });

        const tableData = filteredAppointments.map(appointment => [
            `${appointment.serviceType}${appointment.trainingType !== 'N/A' ? ` (${appointment.trainingType})` : ''}`,
            `${formatDate(appointment.date)} at ${appointment.time}`,
            appointment.status,
            `Rs.${appointment.amount || 'N/A'}`,
            appointment.petOwner,
            appointment.petName,
            appointment.notes || 'N/A'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Service', 'Date & Time', 'Status', 'Amount', 'Pet Owner', 'Pet Name', 'Notes']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 30 },
                5: { cellWidth: 30 },
                6: { cellWidth: 30 },
            },
        });

        doc.setFontSize(8);
        doc.setTextColor(85, 85, 85);
        doc.text(
            'Generated by Online Pet Care System',
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );

        doc.save('all_appointments_report.pdf');
    };

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleResetFilters = () => {
        setServiceFilter('');
        setStatusFilter('');
        setSearchQuery('');
        setSortBy('date');
        setSortOrder('asc');
    };

    // Appointment status counts
    const totalCount = appointments.length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const approvedCount = appointments.filter(a => a.status === 'Approved').length;
    const rejectedCount = appointments.filter(a => a.status === 'Rejected').length;

    return (
        <div className="service-container">

            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <p className="text-center py-5 fade-in">Loading appointments...</p>
            ) : (
                <>
                    {/* Status Cards */}
                    <div className="container py-3">
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#e3f2fd' }}>
                                    <div className="card-body">
                                        <h5 className="card-title">All Appointments</h5>
                                        <p className="card-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#fff3cd' }}>
                                    <div className="card-body">
                                        <h5 className="card-title">Pending</h5>
                                        <p className="card-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pendingCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#d4edda' }}>
                                    <div className="card-body">
                                        <h5 className="card-title">Approved</h5>
                                        <p className="card-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{approvedCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#f8d7da' }}>
                                    <div className="card-body">
                                        <h5 className="card-title">Rejected</h5>
                                        <p className="card-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{rejectedCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    <div className="appointment-count text-center py-3 fade-in" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff5733' }}>
                        Appointments Count: {filteredAppointments.length}
                        {filteredAppointments.length > 0 && (
                            <button
                                className="btn btn-orange ms-3"
                                onClick={downloadAllPDFs}
                            >
                                Download All
                            </button>
                        )}
                    </div>
                    {filteredAppointments.length === 0 ? (
                        <p className="text-center py-5 fade-in">No appointments match your filters.</p>
                    ) : (
                        <div className="appointments-list container py-5">
                            <div className="card hover-card">
                                <div className="card-body">
                                    <table className="appointments-table admin-table">
                                        <thead>
                                            <tr>
                                                <th>Service</th>
                                                <th>Date & Time</th>
                                                <th>Pet Owner</th>
                                                <th>Pet Name</th>
                                                <th>Status</th>
                                                <th>Amount</th>
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
                                                    <td>{formatDate(appointment.date)} at {appointment.time}</td>
                                                    <td>{appointment.petOwner}</td>
                                                    <td>{appointment.petName}</td>
                                                    <td className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</td>
                                                    <td>Rs.{appointment.amount || 'N/A'}</td>
                                                    <td>
                                                        <div className="d-flex flex-column align-items-start gap-1">
                                                            {isFinalStatus(appointment.status) ? (
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <span className={`status-${appointment.status.toLowerCase()}`}>
                                                                        {appointment.status}
                                                                    </span>
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() => handleReopen(appointment._id)}
                                                                    >
                                                                        Reopen
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <select
                                                                    className="form-select status-select"
                                                                    style={{ width: '120px' }}
                                                                    value={appointment.status}
                                                                    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Approved">Approved</option>
                                                                    <option value="Completed">Completed</option>
                                                                    <option value="Rejected">Rejected</option>
                                                                </select>
                                                            )}
                                                            <button
                                                                className="btn btn-info btn-sm w-100"
                                                                onClick={() => handleViewAppointment(appointment)}
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                className="hero-btn download-button btn-sm w-100"
                                                                onClick={() => downloadPDF(appointment)}
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
                </>
            )}

            {/* Bootstrap Modal for Viewing Appointment Details */}
            {selectedAppointment && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Appointment Details</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Service:</strong> {selectedAppointment.serviceType}{selectedAppointment.trainingType !== 'N/A' && ` (${selectedAppointment.trainingType})`}</p>
                                <p><strong>Date & Time:</strong> {formatDate(selectedAppointment.date)} at {selectedAppointment.time}</p>
                                <p><strong>Pet Owner:</strong> {selectedAppointment.petOwner}</p>
                                <p><strong>Pet Name:</strong> {selectedAppointment.petName}</p>
                                <p><strong>Status:</strong> {selectedAppointment.status}</p>
                                <p><strong>Amount:</strong> Rs.{selectedAppointment.amount || 'N/A'}</p>
                                <p><strong>Notes:</strong> {selectedAppointment.notes || 'N/A'}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAppointments;