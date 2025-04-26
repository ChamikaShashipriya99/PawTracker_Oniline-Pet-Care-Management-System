import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email and previewUrl from location state or query params
    const emailFromState = location.state?.email;
    const emailFromQuery = new URLSearchParams(location.search).get('email');
    const previewUrlFromState = location.state?.previewUrl;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      // If no email is provided, redirect to login
      navigate('/login');
    }

    // Set previewUrl if available
    if (previewUrlFromState) {
      setPreviewUrl(previewUrlFromState);
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
    setError('');
    setMessage('');
  };

  const validateForm = () => {
    if (!verificationCode) {
      setError('Verification code is required.');
      return false;
    } else if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/users/verify-email', { 
        email, 
        code: verificationCode 
      });
      
      setMessage(res.data.message);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email is required to resend verification code.');
      return;
    }

    setIsResending(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/resend-verification', { email });
      setMessage(res.data.message);
      
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code.';
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mt-5">
      <br></br>
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Email Verification 🐾</h2>
        <p className="text-center mb-4">
          We've sent a verification code to <strong>{email}</strong>
        </p>
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
            {error && <small className="text-danger">{error}</small>}
            {message && <small className="text-success">{message}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>
            Verify Email
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
        {previewUrl && (
          <div className="mt-3 text-center">
            <p className="text-info">
              <strong>Note:</strong> This is a test email. Click the link below to view it:
            </p>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">
              View Email
            </a>
          </div>
        )}
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default EmailVerification; 