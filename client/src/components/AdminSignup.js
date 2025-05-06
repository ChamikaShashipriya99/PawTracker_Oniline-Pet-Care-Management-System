import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminSignup() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when user starts typing
    setErrors({ ...errors, [e.target.name]: '' });
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
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/users/admin/signup', formData);
      alert('Admin signup successful! Please login.');
      navigate('/admin/login');
    } catch (error) {
      alert('Admin signup failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Admin Sign Up 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" name="firstName" className="form-control" placeholder="First Name" value={formData.firstName} onChange={handleChange} required style={{ borderRadius: '10px' }} />
            {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
          </div>
          <div className="mb-3">
            <input type="text" name="lastName" className="form-control" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required style={{ borderRadius: '10px' }} />
            {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
          </div>
          <div className="mb-3">
            <input type="text" name="username" className="form-control" placeholder="Username" value={formData.username} onChange={handleChange} required style={{ borderRadius: '10px' }} />
            {errors.username && <small className="text-danger">{errors.username}</small>}
          </div>
          <div className="mb-3">
            <input type="email" name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ borderRadius: '10px' }} />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>
          <div className="mb-3">
            <input type="tel" name="phone" className="form-control" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ borderRadius: '10px' }} />
            {errors.phone && <small className="text-danger">{errors.phone}</small>}
          </div>
          <div className="mb-3 position-relative">
            <input 
              type={showPassword.password ? "text" : "password"} 
              name="password" 
              className="form-control" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ borderRadius: '10px', paddingRight: '40px' }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
              style={{ 
                color: '#6c757d',
                padding: '0.375rem',
                marginRight: '0.5rem',
                zIndex: 2
              }}
            >
              <i className={`fas ${showPassword.password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            {errors.password && <small className="text-danger">{errors.password}</small>}
          </div>
          <div className="mb-3 position-relative">
            <input 
              type={showPassword.confirmPassword ? "text" : "password"} 
              name="confirmPassword" 
              className="form-control" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              style={{ borderRadius: '10px', paddingRight: '40px' }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })}
              style={{ 
                color: '#6c757d',
                padding: '0.375rem',
                marginRight: '0.5rem',
                zIndex: 2
              }}
            >
              <i className={`fas ${showPassword.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>Sign Up</button>
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
