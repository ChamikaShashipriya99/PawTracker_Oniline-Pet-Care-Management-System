import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
<<<<<<< HEAD
  const [previewUrl, setPreviewUrl] = useState('');
=======
>>>>>>> Inventory
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
<<<<<<< HEAD
    setPreviewUrl('');
=======
>>>>>>> Inventory
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
      const res = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      setMessage(res.data.message);
      setEmail('');
<<<<<<< HEAD
      
      // If we have a preview URL (from Ethereal Email), set it
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
=======
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
>>>>>>> Inventory
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
<<<<<<< HEAD
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
=======
>>>>>>> Inventory
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