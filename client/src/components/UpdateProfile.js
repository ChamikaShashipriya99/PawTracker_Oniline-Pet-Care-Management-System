import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    ...user,
    password: '', // New password field (optional)
    confirmPassword: '' // Confirm password field (optional)
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(formData.firstName)) newErrors.firstName = "First name must contain only letters.";
    if (!nameRegex.test(formData.lastName)) newErrors.lastName = "Last name must contain only letters.";
    if (!usernameRegex.test(formData.username)) newErrors.username = "Username must be alphanumeric.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";

    // Password validation (only if user is updating it)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare data to send, excluding confirmPassword since it's only for validation
    const { confirmPassword, ...dataToSend } = formData;

    // If password is empty, remove it from the update to avoid sending an empty string
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, dataToSend);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      alert('Update failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Update Profile 🐾</h2>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
          </div>
          <div className="mb-3">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
          </div>
          <div className="mb-3">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.username && <small className="text-danger">{errors.username}</small>}
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>
          <div className="mb-3">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px' }}
            />
            {errors.phone && <small className="text-danger">{errors.phone}</small>}
          </div>
          <div className="mb-3">
            <label>New Password (optional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              style={{ borderRadius: '10px' }}
            />
            {errors.password && <small className="text-danger">{errors.password}</small>}
          </div>
          <div className="mb-3">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              style={{ borderRadius: '10px' }}
            />
            {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
          </div>
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>
              Save
            </button>
            <button type="button" className="btn btn-secondary" style={{ borderRadius: '10px' }} onClick={() => navigate('/profile')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default UpdateProfile;