import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TwoFactorAuth from './TwoFactorAuth';
import config from '../config';

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userFor2FA, setUserFor2FA] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { email: '', password: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email is required.';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: '', password: '' });

    if (!validateForm()) return;
    
    try {
      const response = await axios.post(`${config.API_URL}/users/login`, formData);
      
      if (response.data.needsVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }

      if (response.data.user.twoFactorEnabled) {
        setUserFor2FA(response.data.user);
        setShow2FA(true);
      } else {
        const userData = {
          ...response.data.user,
          createdAt: response.data.user.createdAt
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        navigate('/profile');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        setErrors({ email: '', password: error.response?.data?.message || 'Login failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsLoggedIn(true);
    navigate('/profile');
  };

  return (
    <div className="container mt-5">
      <br></br>
      <div className="card shadow p-4" style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Login 🐾</h2>
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
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} 
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
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }} 
            />
            {errors.password && <small className="text-danger">{errors.password}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: '#555' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Sign up here</Link>
        </p>
        <p className="text-center" style={{ color: '#555' }}>
          Forgot your password? <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>Reset it here</Link>
        </p>
      </div>
      <br></br>
      <br></br>

      {show2FA && (
        <TwoFactorAuth
          user={userFor2FA}
          onClose={() => setShow2FA(false)}
          isLogin={true}
          onSuccess={handle2FASuccess}
        />
      )}
    </div>
  );
}

export default Login;