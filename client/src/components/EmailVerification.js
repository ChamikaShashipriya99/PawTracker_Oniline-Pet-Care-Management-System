import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email;
    const messageFromState = location.state?.message;
    
    if (emailFromState) {
      setEmail(emailFromState);
      if (messageFromState) {
        setMessage(messageFromState);
      }
    } else {
      // If no email is provided, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}/users/verify-email`, {
        email,
        code: verificationCode
      });
      
      setMessage('Email verified successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully! You can now login.' 
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email is required to resend verification code');
      return;
    }

    setIsResending(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${config.API_URL}/users/resend-verification`, { email });
      setMessage('Verification code resent. Please check your email.');
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error.response?.data?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Email Verification 🐾</h2>
        <p className="text-center mb-4">
          We've sent a verification code to <strong>{email}</strong>
        </p>
        {message && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter 6-digit verification code"
              value={verificationCode}
              onChange={handleChange}
              maxLength="6"
              required
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', letterSpacing: '8px', fontSize: '24px', textAlign: 'center' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3" 
            style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary w-100" 
            onClick={handleResendCode}
            disabled={isResending}
            style={{ borderRadius: '10px' }}
          >
            {isResending ? 'Sending...' : 'Resend Verification Code'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailVerification; 