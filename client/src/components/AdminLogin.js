import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminLogin({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when user starts typing
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/users/admin/login', formData);
      if (!res.data.user.isAdmin) {
        throw new Error('Not an admin account');
      }
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
      alert('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Admin login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Admin Login 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>
          <div className="mb-3">
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            {errors.password && <small className="text-danger">{errors.password}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <p className="text-center mt-3">
          No admin account? <Link to="/admin/signup">Sign up here</Link>
        </p>
      </div>
      <br></br><br></br>
    </div>
  );
}

export default AdminLogin;
