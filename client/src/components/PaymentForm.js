import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentForm = ({ isEditMode = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(
    location.state?.paymentDetails ? {
      ...location.state.paymentDetails,
      amount: location.state.paymentDetails.amount?.$numberDecimal || location.state.paymentDetails.amount || ''
    } : {
      name: '',
      email: '',
      phone: '',
      address: '',
      purpose: '',
      amount: ''
    }
  );

  const [errors, setErrors] = useState({});

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    // Only allow letters and spaces
    const cleanedValue = value.replace(/[^A-Za-z\s]/g, '');
    setFormData(prev => ({ ...prev, [name]: cleanedValue }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and enforce 10 digits starting with 0
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 10 && (cleanedValue === '' || cleanedValue[0] === '0')) {
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation - only letters and spaces
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should contain only letters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation - must start with 0 and exactly 10 digits
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must start with 0 and have 10 digits';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Purpose validation
    if (!formData.purpose) {
      newErrors.purpose = 'Purpose is required';
    }

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const submissionData = {
        ...formData,
        amount: formData.amount
      };
  
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/api/payments/update/${formData.transactionId}`,
          submissionData
        );
        navigate('/payment/status', { 
          state: { transactionId: formData.transactionId } 
        });
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/payments/create', 
          submissionData
        );
        navigate('/payment/status', { 
          state: { transactionId: response.data.transactionId } 
        });
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(isEditMode ? 'Error updating payment' : 'Error creating payment');
    }
  };

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div className="card shadow-sm" style={{ width: '500px' }}>
        <div className="card-header bg-primary text-white py-2">
          <h4 className="mb-0 text-center">
            {isEditMode ? 'Edit Payment' : 'Create Payment'}
          </h4>
        </div>
        <div className="card-body p-3">
          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className={`form-control form-control-sm ${errors.name ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                pattern="[A-Za-z\s]+"
                title="Only letters allowed"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Phone</label>
              <input 
                type="tel" 
                className={`form-control form-control-sm ${errors.phone ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength="10"
                pattern="0\d{9}"
                title="Must start with 0 and have 10 digits"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Address</label>
              <textarea 
                className={`form-control form-control-sm ${errors.address ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
              />
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Purpose</label>
              <select 
                className={`form-select form-select-sm ${errors.purpose ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
              >
                <option value="">Select Purpose</option>
                <option value="advertisement">Advertisement</option>
                <option value="Buy Products">Buy Products</option>
                <option value="training program">Training Program</option>
                <option value="vet appointment">Vet Appointment</option>
                <option value="grooming appointment">Grooming Appointment</option>
              </select>
              {errors.purpose && <div className="invalid-feedback">{errors.purpose}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input 
                type="number"
                min="0.01"
                step="any"
                className={`form-control form-control-sm ${errors.amount ? 'is-invalid' : ''}`}
                style={{ textAlign: 'left' }}
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
              {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
            </div>

            <div className="text-center mt-2">
              <button type="submit" className="btn btn-primary btn-sm px-3">
                {isEditMode ? 'Update Payment' : 'View Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

