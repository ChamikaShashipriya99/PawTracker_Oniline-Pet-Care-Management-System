import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payment } = location.state || {};

  const handleViewHistory = () => {
    navigate('/my-payments');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!payment) {
    return (
      <div className="payment-confirmation-container">
        <div className="payment-card">
          <div className="error-message">
            <h2>No Payment Information Found</h2>
            <p>Please complete a payment to view the confirmation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container fade-in">
      <div className="payment-card home-like hover-card">
        <div className="card-body text-center">
          <div className="success-icon mb-4">
            <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#28a745' }}></i>
          </div>
          <h2 className="section-title mb-4">Payment Successful!</h2>
          <div className="confirmation-details mb-4">
            <p className="mb-2">
              <strong>Transaction ID:</strong> {payment.transactionId}
            </p>
            <p className="mb-2">
              <strong>Amount:</strong> LKR {payment.amount?.toFixed(2)}
            </p>
            <p className="mb-2">
              <strong>Payment Method:</strong> {payment.payment_method}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {new Date(payment.paymentDate).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Status:</strong> <span className="badge bg-success">Paid</span>
            </p>
          </div>
          <div className="customer-info mb-4">
            <h4 className="mb-3">Customer Information</h4>
            <p className="mb-2"><strong>Name:</strong> {payment.name}</p>
            <p className="mb-2"><strong>Email:</strong> {payment.email}</p>
            <p className="mb-2"><strong>Phone:</strong> {payment.phone}</p>
            <p className="mb-2"><strong>Purpose:</strong> {payment.purpose}</p>
          </div>
          <div className="action-buttons">
            <button 
              className="btn btn-primary me-3"
              onClick={handleViewHistory}
            >
              <i className="fas fa-history me-2"></i>
              View Payment History
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleBackToHome}
            >
              <i className="fas fa-home me-2"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
//12345
