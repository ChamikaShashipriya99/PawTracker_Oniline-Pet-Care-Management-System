import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

function TwoFactorAuth({ user, onClose, isLogin = false, onSuccess }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.API_URL}/users/verify-2fa-login`, {
        email: user.email,
        token
      });

      if (onSuccess) {
        const userData = {
          ...response.data.user,
          createdAt: response.data.user.createdAt
        };
        onSuccess(userData);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '15px', border: 'none' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid #e9ecef' }}>
            <h5 className="modal-title" style={{ color: '#007bff' }}>
              <i className="fas fa-shield-alt me-2"></i>
              Two-Factor Authentication
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <i className="fas fa-mobile-alt fa-3x mb-3" style={{ color: '#00c4cc' }}></i>
              <h5>Enter Verification Code</h5>
              <p className="text-muted">
                Please enter the 6-digit code from your authenticator app
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ borderRadius: '10px', backgroundColor: '#00c4cc', border: 'none' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  style={{ borderRadius: '10px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorAuth; 