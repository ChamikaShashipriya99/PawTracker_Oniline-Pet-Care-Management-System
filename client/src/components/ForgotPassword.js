import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
    setPreviewUrl('');
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email is required.');
      return false;
    } else if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${config.API_URL}/users/forgot-password`, { email });
      
      if (res.status === 200 && res.data) {
        setMessage(res.data.message);
        setEmail('');
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      let errorMessage;
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <br></br>
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Forgot Password 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
            />
            {error && <small className="text-danger">{error}</small>}
            {message && <small className="text-success">{message}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>
            Send Reset Link
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
        <p className="text-center mt-3" style={{ color: '#555' }}>
          Back to <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default ForgotPassword;