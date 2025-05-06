import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

function TwoFactorSetup({ user, onClose, onStatusChange }) {
  // Check if user already has 2FA enabled and set initial UI accordingly
  const initialStep = user.twoFactorEnabled ? 'manage' : 'initial';
  
  const [step, setStep] = useState(initialStep);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate2FA = async () => {
    try {
      const response = await axios.post(`${config.API_URL}/users/generate-2fa`, {
        userId: user._id
      });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setStep('showQR');
    } catch (error) {
      setError(error.response?.data?.error || 'Error generating 2FA');
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.API_URL}/users/verify-2fa-setup`, {
        userId: user._id,
        token
      });
      setMessage(response.data.message);
      setError('');
      setStatus('success');
      
      // Update user in localStorage
      const updatedUser = { ...user, twoFactorEnabled: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(true);
      }
      
      // Show success message for 3 seconds before closing
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error verifying 2FA setup');
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.API_URL}/users/disable-2fa`, {
        userId: user._id,
        token
      });
      setMessage(response.data.message);
      setError('');
      setStatus('disabled');
      
      // Update user in localStorage
      const updatedUser = { ...user, twoFactorEnabled: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(false);
      }
      
      // Show success message for 3 seconds before closing
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error disabling 2FA');
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
              Setup Two-Factor Authentication
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {status === 'success' && (
              <div className="alert alert-success" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                Two-Factor Authentication has been enabled successfully!
              </div>
            )}
            
            {status === 'disabled' && (
              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                Two-Factor Authentication has been disabled.
              </div>
            )}

            {step === 'manage' && (
              <div>
                <div className="text-center mb-4">
                  <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px', backgroundColor: '#e6f7ff' }}>
                    <i className="fas fa-shield-alt fa-2x text-primary"></i>
                  </div>
                  <h5>Disable Two-Factor Authentication</h5>
                  <p className="text-muted">
                    To disable 2FA, please enter the verification code from your authenticator app.
                  </p>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleDisable2FA();
                }}>
                  <div className="mb-3">
                    <label className="form-label">Enter verification code from your authenticator app</label>
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
                  
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Warning: Disabling 2FA will make your account less secure. We strongly recommend keeping it enabled.
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={isLoading}
                      style={{ borderRadius: '10px' }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Disable 2FA'
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
            )}
            
            {step === 'initial' && (
              <div>
                <p className="mb-4">
                  Scan the QR code with your authenticator app (like Google Authenticator) to enable 2FA.
                  This adds an extra layer of security to your account.
                </p>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleGenerate2FA}
                  style={{ borderRadius: '10px', backgroundColor: '#00c4cc', border: 'none' }}
                >
                  Generate QR Code
                </button>
              </div>
            )}

            {step === 'showQR' && (
              <div>
                <div className="text-center mb-4">
                  <img src={qrCode} alt="2FA QR Code" className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                  <p className="text-muted">Scan this QR code with your authenticator app</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-2"><strong>Manual Entry Key:</strong></p>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={secret}
                      readOnly
                      style={{ borderRadius: '10px' }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(secret)}
                      style={{ borderRadius: '0 10px 10px 0' }}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2"><strong>Backup Codes (save these):</strong></p>
                  <div className="alert alert-warning">
                    <small>
                      These codes can be used to access your account if you lose your authenticator device.
                      Save them in a secure place.
                    </small>
                  </div>
                  <div className="row">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="col-6 mb-2">
                        <code>{code}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleVerifySetup}>
                  <div className="mb-3">
                    <label className="form-label">Enter verification code from your authenticator app</label>
                    <input
                      type="text"
                      className="form-control"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      style={{ borderRadius: '10px' }}
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    style={{ borderRadius: '10px', backgroundColor: '#00c4cc', border: 'none' }}
                  >
                    Verify and Enable
                  </button>
                </form>
              </div>
            )}

            {message && !status && (
              <div className="alert alert-success mt-3" role="alert">
                {message}
              </div>
            )}
            {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorSetup; 