import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

function AdminSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const nameRegex = /^[A-Za-z]+$/;
    const usernameRegex = /^[A-Za-z0-9]+$/;

    if (!formData.firstName) newErrors.firstName = "First name is required.";
    else if (!nameRegex.test(formData.firstName)) newErrors.firstName = "First name should contain only letters.";

    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    else if (!nameRegex.test(formData.lastName)) newErrors.lastName = "Last name should contain only letters.";

    if (!formData.username) newErrors.username = "Username is required.";
    else if (!usernameRegex.test(formData.username)) newErrors.username = "Username should contain only letters and numbers.";

    if (!formData.email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";

    if (!formData.phone) newErrors.phone = "Phone number is required.";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(`${config.API_URL}/users/admin/signup`, formData);
      setSuccessMessage('Admin signup successful! Please login.');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/admin/login');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Admin signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Admin Sign Up 🐾</h2>
        
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
            style={{ borderRadius: '10px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing up...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an admin account? <Link to="/admin/login">Login here</Link>
        </p>
      </div>
      <br></br>
    </div>
  );
}

export default AdminSignup;
