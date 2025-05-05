import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentOTPPage = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/payments/verify-otp', {
        email,
        otp
      });

      if (response.data.message === 'OTP verified successfully') {
        onSuccess();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-card home-like hover-card mt-4" style={{ maxWidth: 400, margin: '0 auto' }}>
      <div className="card-body">
        <h2 className="section-title mb-3">
          <i className="fas fa-key me-2"></i>OTP Verification
        </h2>
        <p className="mb-4 text-muted" style={{ fontSize: '1rem' }}>
          Please enter the 6-digit OTP sent to <b>{email}</b> to verify your payment.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter OTP"
              maxLength={6}
              autoFocus
              required
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="fas fa-check me-2"></i>
            )}
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentOTPPage; 