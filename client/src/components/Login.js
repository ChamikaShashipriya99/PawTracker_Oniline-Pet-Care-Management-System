import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TwoFactorAuth from './TwoFactorAuth';
import config from '../config';

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userFor2FA, setUserFor2FA] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Clear messages after 3 seconds
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setErrorMessage('');
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
    setErrorMessage('');
    setSuccessMessage('');

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
        setSuccessMessage('Login successful! Redirecting...');
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
        
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}
        
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {errorMessage}
            <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
          </div>
        )}

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
          <div className="mb-3 position-relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              className="form-control" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ borderRadius: '10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', paddingRight: '40px' }} 
            />
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                color: '#6c757d',
                padding: '0.375rem',
                marginRight: '0.5rem',
                zIndex: 2
              }}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
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