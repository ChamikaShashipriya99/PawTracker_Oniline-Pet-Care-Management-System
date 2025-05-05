import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminPaymentDashboard = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const query = new URLSearchParams();
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);

      console.log('Fetching payments with query:', query.toString());
      const response = await axios.get(`${API_BASE_URL}/payments/all?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log('Payments response:', response.data);
        setPayments(response.data);
        if (response.data.length === 0) {
          setError('No payments found matching the current filters');
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching payments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message);
        toast.error('Failed to fetch payments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.transactionId?.toLowerCase().includes(query) ||
      payment.userId?.toLowerCase().includes(query) ||
      payment.email?.toLowerCase().includes(query) ||
      payment.purpose?.toLowerCase().includes(query)
    );
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const downloadReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Payment Report', 14, 16);
      doc.setFontSize(10);
      const tableColumn = [
        'Transaction ID',
        'User ID',
        'Email',
        'Amount',
        'Transaction Date',
        'Status',
        'Purpose',
        'Payment Method',
      ];
      const tableRows = payments.map(payment => [
        payment.transactionId,
        payment.userId,
        payment.email,
        `Rs. ${payment.amount.toFixed(2)}`,
        payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—',
        payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
        payment.purpose,
        payment.payment_method,
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 24,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle',
          halign: 'center',
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: 38 }, // Transaction ID
          1: { cellWidth: 38 }, // User ID
          2: { cellWidth: 50 }, // Email
          3: { cellWidth: 22 }, // Amount
          4: { cellWidth: 28 }, // Transaction Date
          5: { cellWidth: 22 }, // Status
          6: { cellWidth: 40 }, // Purpose
          7: { cellWidth: 32 }, // Payment Method
        },
        margin: { left: 8, right: 8 },
        didDrawPage: function (data) {
          doc.setFontSize(9);
          doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 6
          );
        },
      });
      doc.save(`payment_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>
          <i className="fas fa-credit-card me-2"></i>Admin Payment Dashboard
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => {
            try {
              const token = localStorage.getItem('token');
              const user = JSON.parse(localStorage.getItem('user'));
              
              if (!token || !user) {
                toast.error('Please log in to access this page');
                navigate('/admin/login');
                return;
              }
              
              // Store the current path in localStorage
              localStorage.setItem('lastAdminPath', '/admin/payment-dashboard');
              
              // Navigate to refund dashboard
              navigate('/admin/refund-dashboard');
            } catch (error) {
              console.error('Navigation error:', error);
              toast.error('An error occurred while navigating');
            }
          }}
        >
          <i className="fas fa-undo me-2"></i>Go to Refund Dashboard
        </button>
      </div>

      <div className="card shadow-sm mb-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="card-body">
          <h5 className="card-title mb-4" style={{ color: '#007bff' }}>
            <i className="fas fa-filter me-2"></i>Filter Payments
          </h5>
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <label className="form-label fw-bold">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label fw-bold">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label fw-bold">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-control"
                style={{ borderRadius: '8px' }}
                placeholder="Search by ID, email, or purpose"
              />
            </div>
            <div className="col-md-3 col-sm-6 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={downloadReport}
                style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #007bff, #00c4cc)' }}
              >
                <i className="fas fa-download me-2"></i>Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading payments...</p>
            </div>
          ) : error ? (
            <div className="text-center my-5">
              <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <p className="text-danger">{error}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered" style={{ fontSize: '0.95rem' }}>
                <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '12px' }}>Transaction ID</th>
                    <th style={{ padding: '12px' }}>User ID</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Transaction Date</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Purpose</th>
                    <th style={{ padding: '12px' }}>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4" style={{ fontSize: '1rem' }}>
                        <i className="fas fa-info-circle me-2"></i>No payments found
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(payment => (
                      <tr key={payment._id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{payment.transactionId}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{payment.userId}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{payment.email}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{`Rs. ${payment.amount.toFixed(2)}`}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{formatDateTime(payment.paymentDate)}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          <span className={`badge ${payment.status === 'paid' ? 'bg-success' : payment.status === 'failed' ? 'bg-danger' : 'bg-warning'} p-2`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{payment.purpose}</td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{payment.payment_method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminPaymentDashboard; 