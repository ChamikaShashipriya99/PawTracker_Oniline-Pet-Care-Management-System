import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BankTransfer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId;

  const [transferData, setTransferData] = useState({
    transactionId,
    bankName: '',
    depositSlip: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result.split(',')[1] || event.target.result;
      setTransferData(prev => ({
        ...prev,
        depositSlip: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!transferData.bankName) newErrors.bankName = 'Bank name is required';
    if (!transferData.depositSlip) newErrors.depositSlip = 'Deposit slip is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const base64Data = transferData.depositSlip.split(',')[1] || transferData.depositSlip;
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/bank-transfer',
        {
          transactionId: transferData.transactionId,
          bankName: transferData.bankName,
          depositSlip: base64Data
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200) {
        navigate('/payment-success', { 
          state: { 
            transactionId: transferData.transactionId,
            depositSlipPath: response.data.depositSlipPath 
          } 
        });
      }
    } catch (error) {
      console.error('Bank transfer error:', error);
      alert(error.response?.data?.message || 'Error processing bank transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 className="mb-4 text-center">Bank Transfer</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label d-block text-start w-100">Bank Name</label>
            <select 
              className={`form-select ${errors.bankName ? 'is-invalid' : ''}`}
              name="bankName"
              value={transferData.bankName}
              onChange={handleChange}
            >
              <option value="">Select Bank</option>
              <option value="People's Bank">People's Bank</option>
              <option value="Sampath Bank">Sampath Bank</option>
              <option value="BOC">BOC</option>
              <option value="Commercial Bank">Commercial Bank</option>
            </select>
            {errors.bankName && <div className="invalid-feedback text-start">{errors.bankName}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label d-block text-start w-100">Upload Deposit Slip</label>
            <input 
              type="file" 
              className={`form-control ${errors.depositSlip ? 'is-invalid' : ''}`}
              name="depositSlip"
              onChange={handleFileUpload}
              accept="image/*"
              required
            />
            {transferData.depositSlip && (
              <div className="mt-2">
                <img 
                  src={`data:image/jpeg;base64,${transferData.depositSlip}`} 
                  alt="Deposit Slip Preview" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
            {errors.depositSlip && <div className="invalid-feedback text-start">{errors.depositSlip}</div>}
          </div>

          <div className="d-grid mt-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankTransfer;

