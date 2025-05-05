import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminRefundDashboard = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate pending refunds count
  const pendingRefundsCount = refunds.filter(refund => refund.status === 'pending').length;

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        console.error('Access denied: No token or user data');
        toast.error('Please log in to access this page');
        navigate('/admin/login');
        return;
      }

      const query = new URLSearchParams();
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.status) query.append('status', filters.status);

      console.log('Fetching refunds with query:', query.toString());
      const response = await axios.get(`${API_BASE_URL}/refund/admin?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        console.log('Refunds response:', response.data);
        setRefunds(response.data);
        if (response.data.length === 0) {
          setError('No refunds found matching the current filters');
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching refunds:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch refunds. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        toast.error('Please log in to access this page');
        navigate('/admin/login');
        return false;
      }
      
      return true;
    };

    if (checkAuth()) {
    fetchRefunds();
    }
  }, [filters, navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter refunds based on search query
  const filteredRefunds = refunds.filter(refund => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      refund.refundId?.toLowerCase().includes(query) ||
      refund.transactionId?.toLowerCase().includes(query) ||
      refund.email?.toLowerCase().includes(query)
    );
  });

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  const handleApprove = async (refundId) => {
    // Confirmation prompt
    const confirmed = window.confirm('Are you sure you want to approve this refund?');
    if (!confirmed) return;
    try {
      const comment = window.prompt('Please enter a comment for approval:');
      if (comment === null) return; // Cancelled
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/refund/approve/${refundId}`,
        { adminComment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Refund approved successfully');
      fetchRefunds();
    } catch (error) {
      toast.error('Failed to approve refund');
    }
  };

  const handleReject = async (refundId) => {
    // Confirmation prompt
    const confirmed = window.confirm('Are you sure you want to reject this refund?');
    if (!confirmed) return;
    try {
      const comment = window.prompt('Please enter a comment for rejection:');
      if (comment === null) return; // Cancelled
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/refund/reject/${refundId}`,
        { adminComment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Refund rejected successfully');
      fetchRefunds();
    } catch (error) {
      toast.error('Failed to reject refund');
    }
  };

  const downloadReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Refund Report', 14, 16);
      doc.setFontSize(10);
      const tableColumn = [
        'Refund ID',
        'Transaction ID',
        'Email',
        'Amount',
        'Request Date',
        'Action Date',
        'Reason',
        'Status',
      ];
      const tableRows = filteredRefunds.map(refund => [
        refund.refundId,
        refund.transactionId,
        refund.email,
        `LKR ${refund.amount.toFixed(2)}`,
        refund.createdAt ? new Date(refund.createdAt).toLocaleDateString() : '—',
        refund.actionDate ? new Date(refund.actionDate).toLocaleDateString() : '—',
        refund.reason,
        refund.status.charAt(0).toUpperCase() + refund.status.slice(1),
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
          0: { cellWidth: 32 }, // Refund ID
          1: { cellWidth: 38 }, // Transaction ID
          2: { cellWidth: 50 }, // Email
          3: { cellWidth: 22 }, // Amount
          4: { cellWidth: 28 }, // Request Date
          5: { cellWidth: 28 }, // Action Date
          6: { cellWidth: 40 }, // Reason
          7: { cellWidth: 22 }, // Status
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
      doc.save(`refund_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const handleBackToPaymentDashboard = () => {
    const lastPath = localStorage.getItem('lastAdminPath') || '/admin/payment-dashboard';
    navigate(lastPath);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
        <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>
          <i className="fas fa-undo me-2"></i>Admin Refund Dashboard
        </h2>
          <div className="mt-2" style={{ color: '#666', fontSize: '1.1rem' }}>
            <span className="badge bg-warning text-dark p-2" style={{ fontSize: '1rem', fontWeight: '500' }}>
              <i className="fas fa-clock me-1"></i>
              Pending Refunds: {pendingRefundsCount}
            </span>
          </div>
        </div>
        <button 
          className="btn btn-outline-primary"
          onClick={handleBackToPaymentDashboard}
        >
          <i className="fas fa-credit-card me-2"></i>Go to Payment Dashboard
        </button>
      </div>

      <div className="card shadow-sm mb-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="card-body">
          <h5 className="card-title mb-4" style={{ color: '#007bff' }}>
            <i className="fas fa-filter me-2"></i>Filter Refunds
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
                placeholder="Search by ID or email"
              />
            </div>
            <div className="col-md-3 col-sm-6">
              <label className="form-label fw-bold">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
                style={{ borderRadius: '8px' }}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
              <p className="mt-2">Loading refunds...</p>
            </div>
          ) : error ? (
            <div className="text-center my-5">
              <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <p className="text-danger">{error}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered" style={{ fontSize: '0.95rem' }}>
                <thead style={{ backgroundColor: '#007bff', color: 'white', fontSize: '0.95rem' }}>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Refund ID</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Transaction ID</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Reason</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Request Date</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Action Date</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Admin Comment</th>
                    <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-3" style={{ fontSize: '0.95rem' }}>
                        <i className="fas fa-info-circle me-2"></i>No refunds found
                      </td>
                    </tr>
                  ) : (
                    filteredRefunds.map(refund => (
                      <tr key={refund._id} style={{ transition: 'background-color 0.2s', verticalAlign: 'middle' }}>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{refund.refundId}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{refund.transactionId}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{refund.email}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{`LKR ${refund.amount.toFixed(2)}`}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{refund.reason}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{formatDateTime(refund.createdAt)}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>{refund.actionDate ? formatDateTime(refund.actionDate) : '—'}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center', maxWidth: '180px', wordBreak: 'break-word' }}>{refund.adminComment || '—'}</td>
                        <td style={{ padding: '8px', fontSize: '0.95rem', textAlign: 'center' }}>
                          {refund.status === 'pending' ? (
                            <div className="d-flex justify-content-center align-items-center gap-2">
                              <button
                                className="btn btn-success btn-sm px-3"
                                style={{ fontWeight: 500, fontSize: '0.95rem', borderRadius: '6px' }}
                                onClick={() => handleApprove(refund._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm px-3"
                                style={{ fontWeight: 500, fontSize: '0.95rem', borderRadius: '6px' }}
                                onClick={() => handleReject(refund._id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : refund.status === 'approved' ? (
                            <span className="badge bg-success p-2" style={{ fontSize: '1rem', fontWeight: 600, borderRadius: '8px', display: 'inline-block', minWidth: '80px' }}>Approved</span>
                          ) : (
                            <span className="badge bg-danger p-2" style={{ fontSize: '1rem', fontWeight: 600, borderRadius: '8px', display: 'inline-block', minWidth: '80px' }}>Rejected</span>
                          )}
                        </td>
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

export default AdminRefundDashboard;