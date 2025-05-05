import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
=======
>>>>>>> Inventory

function ResetPassword({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setMessage('');
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { password: '', confirmPassword: '' };

    if (!formData.password) {
      newErrors.password = 'Password is required.';
      valid = false;
<<<<<<< HEAD
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
      valid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number.';
      valid = false;
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter.';
      valid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter.';
      valid = false;
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character.';
=======
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
>>>>>>> Inventory
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password: formData.password });
      setMessage(res.data.message);
      setFormData({ password: '', confirmPassword: '' });
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect to login after 2 seconds
    } catch (error) {
      setErrors({ ...errors, password: error.response?.data?.message || 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="container mt-5">
      <br></br>
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Reset Password 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
            />
            {errors.password && <small className="text-danger">{errors.password}</small>}
<<<<<<< HEAD
            <PasswordStrengthIndicator password={formData.password} />
=======
>>>>>>> Inventory
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
            />
            {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
            {message && <small className="text-success">{message}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>
            Reset Password
          </button>
        </form>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default ResetPassword;