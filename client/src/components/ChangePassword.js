import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setStatus({ message: '', type: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        throw new Error('User session expired. Please log in again.');
      }

      const response = await axios.put(
        `${config.API_URL}/users/change-password/${user._id}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setStatus({
        message: 'Password changed successfully!',
        type: 'success'
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to change password. Please try again.';
      
      setStatus({
        message: errorMessage,
        type: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-4" style={{ 
      borderRadius: '15px', 
      border: 'none', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
    }}>
      <div className="card-header bg-white" style={{ 
        borderRadius: '15px 15px 0 0', 
        borderBottom: '1px solid #e9ecef',
        padding: '1.5rem'
      }}>
        <h5 className="mb-0" style={{ 
          color: '#007bff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-lock fa-lg"></i>
          Change Password
        </h5>
      </div>
      <div className="card-body p-4">
        {status.message && (
          <div className={`alert alert-${status.type} alert-dismissible fade show`} role="alert" style={{ borderRadius: '10px' }}>
            <i className={`fas fa-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
            {status.message}
            <button type="button" className="btn-close" onClick={() => setStatus({ message: '', type: '' })}></button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
              <i className="fas fa-key me-2"></i>Current Password
            </label>
            <div className="input-group">
              <input
                type={showPassword.currentPassword ? "text" : "password"}
                name="currentPassword"
                className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                style={{ 
                  borderRadius: '10px',
                  height: '50px',
                  border: '1px solid #ced4da',
                  padding: '0.75rem'
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility('currentPassword')}
                style={{ 
                  borderRadius: '0 10px 10px 0',
                  border: '1px solid #ced4da'
                }}
              >
                <i className={`fas fa-${showPassword.currentPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            {errors.currentPassword && (
              <div className="invalid-feedback d-flex align-items-center mt-2">
                <i className="fas fa-exclamation-circle me-2"></i>
                {errors.currentPassword}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
              <i className="fas fa-lock me-2"></i>New Password
            </label>
            <div className="input-group">
              <input
                type={showPassword.newPassword ? "text" : "password"}
                name="newPassword"
                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                style={{ 
                  borderRadius: '10px',
                  height: '50px',
                  border: '1px solid #ced4da',
                  padding: '0.75rem'
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility('newPassword')}
                style={{ 
                  borderRadius: '0 10px 10px 0',
                  border: '1px solid #ced4da'
                }}
              >
                <i className={`fas fa-${showPassword.newPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            {errors.newPassword && (
              <div className="invalid-feedback d-flex align-items-center mt-2">
                <i className="fas fa-exclamation-circle me-2"></i>
                {errors.newPassword}
              </div>
            )}
            <div className="mt-2">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
              </small>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
              <i className="fas fa-lock me-2"></i>Confirm New Password
            </label>
            <div className="input-group">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                style={{ 
                  borderRadius: '10px',
                  height: '50px',
                  border: '1px solid #ced4da',
                  padding: '0.75rem'
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                style={{ 
                  borderRadius: '0 10px 10px 0',
                  border: '1px solid #ced4da'
                }}
              >
                <i className={`fas fa-${showPassword.confirmPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="invalid-feedback d-flex align-items-center mt-2">
                <i className="fas fa-exclamation-circle me-2"></i>
                {errors.confirmPassword}
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary"
              style={{ 
                backgroundColor: '#00c4cc', 
                border: 'none', 
                borderRadius: '10px',
                padding: '10px 25px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              disabled={isSubmitting}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Changing Password...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i> Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword; 