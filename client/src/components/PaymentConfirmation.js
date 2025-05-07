import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentDetails, customerInfo } = location.state || {};

  // Combine paymentDetails and customerInfo for backward compatibility
  const payment = paymentDetails ? {
    ...paymentDetails,
    payment_method: paymentDetails.paymentMethod,
    paymentDate: paymentDetails.date,
    amount: parseFloat(paymentDetails.amount),
    customer: customerInfo
  } : null;

  const handleViewHistory = () => {
    // Simple navigation, let the route handle authentication
    navigate('/payment-history');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!payment || !paymentDetails) {
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
              <strong>Purpose:</strong> {payment.customer.purpose}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {new Date(payment.paymentDate).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Status:</strong> <span className="badge bg-success">Paid</span>
            </p>
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