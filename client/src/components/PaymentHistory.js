import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Payment.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Debug: Log to confirm Payment.css import attempt
console.log('Attempting to import Payment.css from src/components/');

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="alert alert-danger">Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

// Reusable Input Component
const FormInput = ({ label, type, name, value, onChange, placeholder, required }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <input
      type={type}
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-label={label}
    />
  </div>
);

// Reusable Select Component
const FormSelect = ({ label, name, value, onChange, options, required }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <select
      className="form-select"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      aria-label={label}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Reusable Textarea Component
const FormTextarea = ({ label, name, value, onChange, placeholder, error, rows, required }) => (
  <div className="mb-3">
    <label className="form-label">
      <i className="fas fa-comment me-2 text-primary"></i>{label}
    </label>
    <textarea
      className={`form-control ${error ? 'is-invalid' : ''}`}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || ''}
      rows={rows}
      style={{ border: '1px solid #00c4cc' }}
      aria-label={label}
      required={required}
    />
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const API_BASE_URL = 'http://localhost:5000';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRefund, setProcessingRefund] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    refundStatus: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(new Date().toISOString());
  const [currencySymbol, setCurrencySymbol] = useState('LKR ');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'paymentDate', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const fetchPaymentsAndRefunds = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      console.log('User from localStorage:', user);
      console.log('Token from localStorage:', token);

      if (!user || !token) {
        toast.error('Please login to view payment history');
        navigate('/login');
        return;
      }

      console.log('Fetching payments for user:', user._id);

      // Build query string
      const query = new URLSearchParams();
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.status) query.append('status', filters.status);
      if (filters.refundStatus) query.append('refundStatus', filters.refundStatus);
      query.append('userId', user._id);

      console.log('Payments API URL:', `${API_BASE_URL}/api/payments/user?${query.toString()}`);

      // Fetch payments
      const paymentResponse = await axios.get(`${API_BASE_URL}/api/payments/user?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Payments API Response:', paymentResponse.data);
      setPayments(paymentResponse.data);

      // Fetch refunds
      console.log('Refunds API URL:', `${API_BASE_URL}/api/refund/user?userId=${user._id}`);
      const refundResponse = await axios.get(`${API_BASE_URL}/api/refund/user?userId=${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Refunds API Response:', refundResponse.data);
      setRefunds(refundResponse.data);
    } catch (error) {
      console.error('Error fetching payments and refunds:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Check server configuration.');
      } else {
        toast.error('Failed to load payments or refunds');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (!user || !token) return;

      console.log('Checking notifications for user:', user._id);

      const response = await axios.get(
        `${API_BASE_URL}/api/refund/notifications?lastChecked=${lastChecked}&userId=${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Notifications response:', response.data);

      if (response.data.length > 0) {
        const newNotifications = response.data.map(refund => ({
          transactionId: refund.transactionId,
          status: refund.status,
          message: refund.status === 'approved'
            ? `✅ Your refund request for ${refund.transactionId} is now Approved.`
            : `❗Your refund request for ${refund.transactionId} is now Rejected: ${refund.adminComment || 'No reason provided'}.`
        }));
        setNotifications(prev => [...newNotifications, ...prev]);
        setLastChecked(new Date().toISOString());

        setPayments(prevPayments =>
          prevPayments.map(payment => {
            const updatedRefund = response.data.find(r => r.transactionId === payment.transactionId);
            if (updatedRefund) {
              return {
                ...payment,
                refundStatus: updatedRefund.status,
                refundDecisionDate: updatedRefund.actionDate || updatedRefund.updatedAt,
                adminComment: updatedRefund.adminComment
              };
            }
            return payment;
          })
        );
      }
    } catch (error) {
      console.error('Notification check error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.log('Notifications endpoint not found. Skipping notifications update.');
      } else if (error.response?.status === 500) {
        console.log('Server error during notification check:', error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    fetchPaymentsAndRefunds();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [location.state]);

  // Search functionality
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;

    const lowerQuery = searchQuery.toLowerCase();
    return payments.filter(payment =>
      payment.transactionId.toLowerCase().includes(lowerQuery) ||
      payment.purpose.toLowerCase().includes(lowerQuery)
    );
  }, [payments, searchQuery]);

  // Sorting functionality
  const sortedPayments = useMemo(() => {
    const sortablePayments = [...filteredPayments];
    if (sortConfig.key) {
      sortablePayments.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'paymentDate' || sortConfig.key === 'createdAt') {
          aValue = new Date(aValue || a.createdAt || a.paymentDate);
          bValue = new Date(bValue || b.createdAt || b.paymentDate);
        } else if (sortConfig.key === 'amount') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else {
          aValue = aValue ? aValue.toString().toLowerCase() : '';
          bValue = bValue ? bValue.toString().toLowerCase() : '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortablePayments;
  }, [filteredPayments, sortConfig]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRefundClick = (payment) => {
    if (hasExistingRefund(payment.transactionId)) {
      toast.error('Refund already requested for this transaction');
      return;
    }
    setSelectedPayment(payment);
    setRefundReason('');
    setReasonError('');
    setShowRefundModal(true);
  };

  const handleRefundModalClose = () => {
    setShowRefundModal(false);
    setSelectedPayment(null);
    setRefundReason('');
    setReasonError('');
  };

  const handleReasonChange = (e) => {
    setRefundReason(e.target.value);
    if (e.target.value.trim()) {
      setReasonError('');
    }
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    if (!refundReason.trim()) {
      setReasonError('Please provide a reason for the refund request');
      toast.error('Refund reason is required');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (!user || !token) {
        toast.error('Please login to request a refund');
        navigate('/login');
        return;
      }

      setProcessingRefund(selectedPayment.transactionId);

      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // Generated but ignored by backend

      const response = await axios.post(`${API_BASE_URL}/api/refund/request`, {
        transactionId: selectedPayment.transactionId,
        refundId: refundId, // Included for consistency, ignored by backend
        amount: parseFloat(selectedPayment.amount),
        email: user.email,
        reason: refundReason,
        userId: user._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message === 'Refund request submitted successfully') {
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment.transactionId === selectedPayment.transactionId
              ? { ...payment, refundStatus: 'pending' }
              : payment
          )
        );

        setRefunds(prevRefunds => [
          ...prevRefunds,
          { transactionId: selectedPayment.transactionId, status: 'pending' }
        ]);

        toast.success('Refund request submitted successfully');
        handleRefundModalClose();
      } else {
        throw new Error('Failed to submit refund request');
      }
    } catch (error) {
      console.error('Refund request error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid request');
      } else if (error.response?.status === 404) {
        toast.error('Transaction not found');
      } else {
        toast.error('Failed to request refund');
      }
    } finally {
      setProcessingRefund(null);
    }
  };

  const hasExistingRefund = (transactionId) => {
    return refunds.some(refund => refund.transactionId === transactionId);
  };

  const getRefundStatusDisplay = (payment) => {
    if (processingRefund === (payment._id || payment.transactionId)) {
      return (
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Processing...</span>
          </div>
          Processing...
        </div>
      );
    }

    if (payment.refundStatus && ['pending', 'approved', 'rejected'].includes(payment.refundStatus.toLowerCase())) {
      const statusConfig = {
        pending: { icon: '⏳', text: 'Pending', className: 'bg-warning text-dark p-2 rounded' },
        approved: { icon: '✅', text: 'Approved', className: 'bg-success text-white p-2 rounded' },
        rejected: { icon: '❗', text: 'Rejected', className: 'bg-danger text-white p-2 rounded' }
      };

      const status = statusConfig[payment.refundStatus.toLowerCase()];
      return (
        <span
          className={`badge ${status.className}`}
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            display: 'inline-block',
            minWidth: '80px',
            textAlign: 'center'
          }}
        >
          {status.icon} {status.text}
        </span>
      );
    }

    if (payment.status === 'paid' && !hasExistingRefund(payment.transactionId)) {
      return (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleRefundClick(payment)}
          disabled={!!processingRefund}
          aria-label="Request Refund"
        >
          Request Refund
        </button>
      );
    }

    return '❌ Not Eligible';
  };

  const handleCloseNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    navigate('/profile');
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('My Payment History', 14, 16);
      doc.setFontSize(10);
      const tableColumn = [
      'Transaction ID',
      'Amount',
      'Date',
      'Status',
      'Purpose',
      'Payment Method',
      'Refund Status',
        'Refund Decision Date',
        'Admin Comment',
    ];
      const tableRows = filteredPayments.map(payment => [
      payment.transactionId,
        `LKR ${parseFloat(payment.amount).toFixed(2)}`,
        payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—',
        payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      payment.purpose,
        payment.payment_method,
        payment.refundStatus ? payment.refundStatus.charAt(0).toUpperCase() + payment.refundStatus.slice(1) : '—',
        payment.refundDecisionDate ? new Date(payment.refundDecisionDate).toLocaleDateString() : '—',
        payment.adminComment || '—',
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
          1: { cellWidth: 22 }, // Amount
          2: { cellWidth: 28 }, // Date
          3: { cellWidth: 22 }, // Status
          4: { cellWidth: 40 }, // Purpose
          5: { cellWidth: 32 }, // Payment Method
          6: { cellWidth: 32 }, // Refund Status
          7: { cellWidth: 32 }, // Refund Decision Date
          8: { cellWidth: 40 }, // Admin Comment
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
      doc.save(`my_payments_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF report');
    }
  };

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const refundStatusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = (payment) => {
    setIsEditing(true);
    setEditingPayment({
      ...payment,
      name: payment.name || '',
      phone: payment.phone || '',
      address: payment.address || '',
      purpose: payment.purpose || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPayment(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    const errors = {};
    if (!editingPayment.name?.trim()) errors.name = 'Name is required';
    if (!editingPayment.phone?.trim()) errors.phone = 'Phone number is required';
    if (!editingPayment.address?.trim()) errors.address = 'Address is required';
    if (!editingPayment.purpose?.trim()) errors.purpose = 'Purpose is required';

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Update payment in the backend
      const response = await axios.put(
        `${API_BASE_URL}/api/payments/${editingPayment._id}`,
        {
          name: editingPayment.name,
          phone: editingPayment.phone,
          address: editingPayment.address,
          purpose: editingPayment.purpose
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the payment in the local state
      setPayments(prevPayments =>
        prevPayments.map(payment =>
          payment._id === editingPayment._id
            ? { ...payment, ...editingPayment }
            : payment
        )
      );

      // Update summary card if this payment is selected
      setSelectedPayment(prev =>
        prev && prev._id === editingPayment._id
          ? { ...prev, ...editingPayment }
          : prev
      );
      setIsEditing(false);
      setEditingPayment(null);
      setEditErrors({});
      toast.success('Payment information updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPayment(null);
    setEditErrors({});
  };

  return (
    <ErrorBoundary>
      <div className="payment-container fade-in">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="payment-card home-like hover-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="section-title">
                      <i className="fas fa-history me-2"></i>My Payments
                    </h2>
                    <div>
                      <button
                        className="btn btn-primary me-2"
                        onClick={exportToPDF}
                        disabled={payments.length === 0}
                        aria-label="Export to PDF"
                      >
                        <i className="fas fa-file-pdf me-2"></i>Export to PDF
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleBack}
                        aria-label="Back to Profile"
                      >
                        <i className="fas fa-arrow-left me-2"></i>Back to Profile
                      </button>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-3">
                      <FormInput
                        label="Search"
                        type="text"
                        name="searchQuery"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by Transaction ID or Purpose"
                      />
                    </div>
                    <div className="col-md-2">
                      <FormInput
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <FormInput
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <FormSelect
                        label="Payment Status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={statusOptions}
                      />
                    </div>
                    <div className="col-md-2">
                      <FormSelect
                        label="Refund Status"
                        name="refundStatus"
                        value={filters.refundStatus}
                        onChange={handleFilterChange}
                        options={refundStatusOptions}
                      />
                    </div>
                  </div>

                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`notification-popup ${
                        notification.status === 'approved' ? 'success' :
                        notification.status === 'rejected' ? 'error' : 'warning'
                      }`}
                    >
                      <button
                        className="close-btn"
                        onClick={() => handleCloseNotification(index)}
                        aria-label="Close notification"
                      >
                        ×
                      </button>
                      <p>{notification.message}</p>
                    </div>
                  ))}

                  {isLoading ? (
                    <div className="text-center my-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading your payments...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                          <thead>
                            <tr>
                              <th onClick={() => handleSort('transactionId')}>
                                Transaction ID {sortConfig.key === 'transactionId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th onClick={() => handleSort('amount')}>
                                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th onClick={() => handleSort('paymentDate')}>
                                Date {sortConfig.key === 'paymentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th onClick={() => handleSort('status')}>
                                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th onClick={() => handleSort('purpose')}>
                                Purpose {sortConfig.key === 'purpose' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </th>
                              <th>Payment Method</th>
                              <th>Refund Status</th>
                              <th>Decision Date</th>
                              <th>Admin Comment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedPayments.length === 0 ? (
                              <tr>
                                <td colSpan="9" className="text-center py-4">
                                  <i className="fas fa-wallet fa-2x mb-3 d-block"></i>
                                  No payment history found
                                </td>
                              </tr>
                            ) : (
                              paginatedPayments.map((payment) => (
                                <tr key={payment._id || payment.transactionId}>
                                  <td>{payment.transactionId}</td>
                                  <td>{currencySymbol}{parseFloat(payment.amount).toFixed(2)}</td>
                                  <td>{formatDate(payment.paymentDate || payment.createdAt)}</td>
                                  <td>
                                    <span className={`badge ${payment.status === 'paid' ? 'bg-success' : payment.status === 'failed' ? 'bg-danger' : 'bg-warning'}`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                  <td>{payment.purpose}</td>
                                  <td>{payment.payment_method || '—'}</td>
                                  <td>
                                    {getRefundStatusDisplay(payment)}
                                  </td>
                                  <td>{formatDate(payment.refundDecisionDate)}</td>
                                  <td>{payment.adminComment || '—'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <nav aria-label="Page navigation">
                          <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                aria-label="Previous"
                              >
                                Previous
                              </button>
                            </li>
                            {[...Array(totalPages).keys()].map(page => (
                              <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(page + 1)}
                                >
                                  {page + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                aria-label="Next"
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}

                      {paginatedPayments.length === 0 && (
                        <div className="text-center mt-3">
                          <button
                            className="btn btn-primary"
                            onClick={() => navigate('/payment-checkout')}
                            aria-label="Make a Payment"
                          >
                            <i className="fas fa-plus-circle me-2"></i>Make a Payment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showRefundModal && (
          <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content home-like hover-card">
                  <form onSubmit={handleRequestRefund}>
                    <div className="modal-header" style={{ background: 'linear-gradient(135deg, #00c4cc, #007bff)', color: 'white' }}>
                      <h5 className="modal-title">
                        <i className="fas fa-undo me-2"></i>Request Refund
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={handleRefundModalClose}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-receipt me-2 text-primary"></i>
                          <span><strong>Transaction ID:</strong> {selectedPayment?.transactionId}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-dollar-sign me-2 text-primary"></i>
                          <span><strong>Amount:</strong> {currencySymbol}{parseFloat(selectedPayment?.amount).toFixed(2)}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-calendar me-2 text-primary"></i>
                          <span><strong>Date:</strong> {formatDate(selectedPayment?.paymentDate || selectedPayment?.createdAt)}</span>
                        </div>
                      </div>
                      <FormTextarea
                        label="Reason for Refund"
                        name="refundReason"
                        value={refundReason}
                        onChange={handleReasonChange}
                        placeholder="Please provide a reason for your refund request..."
                        error={reasonError}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRefundModalClose}
                        style={{ background: 'linear-gradient(135deg, #6c757d, #495057)' }}
                        aria-label="Cancel"
                      >
                        <i className="fas fa-times me-2"></i>Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!refundReason.trim() || processingRefund}
                        style={{ background: 'linear-gradient(135deg, #00c4cc, #007bff)' }}
                        aria-label="Submit Request"
                      >
                        {processingRefund ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}

        {/* Edit Modal */}
        {isEditing && editingPayment && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content home-like hover-card">
                <form onSubmit={handleSaveEdit}>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #00c4cc, #007bff)', color: 'white' }}>
                    <h5 className="modal-title">
                      <i className="fas fa-edit me-2"></i>Edit Payment Information
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={handleCancelEdit}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className={`form-control ${editErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={editingPayment.name || ''}
                        onChange={handleEditChange}
                        required
                      />
                      {editErrors.name && <div className="invalid-feedback">{editErrors.name}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className={`form-control ${editErrors.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        value={editingPayment.phone || ''}
                        onChange={handleEditChange}
                        required
                      />
                      {editErrors.phone && <div className="invalid-feedback">{editErrors.phone}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className={`form-control ${editErrors.address ? 'is-invalid' : ''}`}
                        name="address"
                        value={editingPayment.address || ''}
                        onChange={handleEditChange}
                        rows="3"
                        required
                      />
                      {editErrors.address && <div className="invalid-feedback">{editErrors.address}</div>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Purpose</label>
                      <select
                        className={`form-select ${editErrors.purpose ? 'is-invalid' : ''}`}
                        name="purpose"
                        value={editingPayment.purpose || ''}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Select Purpose</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Medication">Medication</option>
                        <option value="Grooming">Grooming</option>
                        <option value="Boarding">Boarding</option>
                        <option value="Other">Other</option>
                      </select>
                      {editErrors.purpose && <div className="invalid-feedback">{editErrors.purpose}</div>}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      style={{ background: 'linear-gradient(135deg, #6c757d, #495057)' }}
                    >
                      <i className="fas fa-times me-2"></i>Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                      style={{ background: 'linear-gradient(135deg, #00c4cc, #007bff)' }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
};

export default PaymentHistory;