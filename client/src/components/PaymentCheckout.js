import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalInfoForm from './PersonalInfoForm';
import PaymentMethodForm from './PaymentMethodForm';
import PaymentConfirmation from './PaymentConfirmation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Payment.css';

// Validate customer information for edit form
const validateCustomerInfo = (info, field = null) => {
  const errors = field ? {} : {};
  if (!field || field === 'name') {
    if (!info.name.trim()) errors.name = 'Name is required';
    else if (!/^[A-Za-z\s]+$/.test(info.name)) errors.name = 'Name should contain only letters';
  }
  if (!field || field === 'email') {
    if (!info.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errors.email = 'Invalid email format';
  }
  if (!field || field === 'phone') {
    if (!info.phone) errors.phone = 'Phone number is required';
    else if (!/^0\d{9}$/.test(info.phone)) errors.phone = 'Phone must start with 0 and have 10 digits';
  }
  if (!field || field === 'address') {
    if (!info.address.trim()) errors.address = 'Address is required';
  }
  if (!field || field === 'purpose') {
    if (!info.purpose) errors.purpose = 'Purpose is required';
  }
  if (!field || field === 'amount') {
    if (!info.amount) errors.amount = 'Amount is required';
    else if (isNaN(info.amount) || parseFloat(info.amount) <= 0) errors.amount = 'Amount must be a positive number';
  }
  return errors;
};

// Transform customer information before saving
const transformCustomerInfo = (info) => {
  return {
    ...info,
    name: info.name.replace(/[^A-Za-z\s]/g, ''),
    phone: info.phone.replace(/\D/g, '').slice(0, 10),
  };
};

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Add useEffect to check authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      localStorage.setItem('returnUrl', '/payment-checkout');
      toast.error('Please login to access the payment page');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    purpose: '',
    amount: '',
  });
  const [customerErrors, setCustomerErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardType: '',
    nameOnCard: '',
    cardNumber: '',
    cvv: '',
    expirationDate: '',
  });
  const [cardErrors, setCardErrors] = useState({});
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    depositSlip: null,
    depositedAmount: '',
    depositedDate: '',
    branchName: '',
  });
  const [bankErrors, setBankErrors] = useState({});
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempCustomerInfo, setTempCustomerInfo] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  const handleEdit = () => {
    setIsEditing(true);
    // Get the logged-in user's email
    const user = JSON.parse(localStorage.getItem('user'));
    setTempCustomerInfo({ 
      ...submittedInfo,
      email: user?.email || submittedInfo.email 
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditErrors({});
    setTempCustomerInfo(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const transformedInfo = transformCustomerInfo(tempCustomerInfo);
    const errors = validateCustomerInfo(transformedInfo);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    try {
      setIsLoading(true);
      setSubmittedInfo(transformedInfo);
      setCustomerInfo(transformedInfo);
      setIsEditing(false);
      setTempCustomerInfo(null);
      toast.success('Personal information updated successfully!');
    } catch (error) {
      const message = 'Error updating payment. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBlur = (e) => {
    const { name } = e.target;
    // Only validate, do not update tempCustomerInfo here
    const errors = validateCustomerInfo(tempCustomerInfo, name);
    setEditErrors(errors);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setTempCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const FormInput = ({ label, type, name, value, onChange, onBlur, placeholder, error, title, maxLength, required }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || ''}
        title={title}
        maxLength={maxLength}
        aria-label={label}
        required={required}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );

  const FormTextarea = ({ label, name, value, onChange, onBlur, placeholder, error, rows, required }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <textarea
        className={`form-control ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || ''}
        rows={rows}
        aria-label={label}
        required={required}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );

  const FormSelect = ({ label, name, value, onChange, onBlur, options, error, required }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <select
        className={`form-control ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-label={label}
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );

  const purposeOptions = [
    { value: '', label: 'Select Purpose' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'store_purchase', label: 'Store Purchase' },
    { value: 'veterinary_service', label: 'Veterinary Service' },
    { value: 'grooming_service', label: 'Grooming Service' },
    { value: 'training_service', label: 'Training Service' },
  ];

  return (
    <div className="payment-container fade-in">
      <div className="container">
        <div className="row">
          {step !== 3 && (
            <div className="col-md-6 mb-4">
              {submittedInfo && !isEditing ? (
                <div className="payment-card home-like hover-card">
                  <div className="card-body">
                    <h3 className="text-center mb-4">${parseFloat(submittedInfo.amount).toFixed(2)}</h3>
                    <hr className="mb-4" />
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-user me-2"></i>
                        <span><strong>Name:</strong> {submittedInfo.name}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-envelope me-2"></i>
                        <span><strong>Email:</strong> {submittedInfo.email}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-phone me-2"></i>
                        <span><strong>Phone:</strong> {submittedInfo.phone}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        <span><strong>Address:</strong> {submittedInfo.address}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-clipboard-list me-2"></i>
                        <span><strong>Purpose:</strong> {submittedInfo.purpose}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-receipt me-2"></i>
                        <span><strong>Transaction ID:</strong> {submittedInfo.transactionId}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary w-100" onClick={handleEdit}>
                      <i className="fas fa-edit me-2"></i>Edit
                    </button>
                  </div>
                </div>
              ) : submittedInfo && isEditing ? (
                <div className="form-container fade-in">
                  <div className="payment-card home-like hover-card">
                    <div className="card-body">
                      <h5 className="section-title">
                        <i className="fas fa-user-edit me-2"></i>Edit Personal Information
                      </h5>
                      <form onSubmit={handleSaveEdit} noValidate>
                        <FormInput
                          label="Name"
                          type="text"
                          name="name"
                          value={tempCustomerInfo.name || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          error={editErrors.name}
                          title="Only letters allowed"
                          required
                        />
                        <FormInput
                          label="Email"
                          type="email"
                          name="email"
                          value={tempCustomerInfo.email || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          error={editErrors.email}
                          required
                          readOnly
                          style={{ backgroundColor: '#e9ecef' }}
                        />
                        <FormInput
                          label="Phone"
                          type="tel"
                          name="phone"
                          value={tempCustomerInfo.phone || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          error={editErrors.phone}
                          maxLength="10"
                          title="Must start with 0 and have 10 digits"
                          required
                        />
                        <FormTextarea
                          label="Address"
                          name="address"
                          value={tempCustomerInfo.address || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          error={editErrors.address}
                          rows="2"
                          required
                        />
                        <FormSelect
                          label="Purpose"
                          name="purpose"
                          value={tempCustomerInfo.purpose || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          options={purposeOptions}
                          error={editErrors.purpose}
                          required
                        />
                        <FormInput
                          label="Amount"
                          type="number"
                          name="amount"
                          value={tempCustomerInfo.amount || ''}
                          onChange={handleEditChange}
                          onBlur={handleEditBlur}
                          error={editErrors.amount}
                          min="0.01"
                          step="0.01"
                          required
                          readOnly
                          style={{ backgroundColor: '#e9ecef' }}
                        />
                        <div className="d-flex justify-content-end mt-4">
                          <button
                            type="button"
                            className="btn btn-secondary me-2"
                            onClick={handleCancelEdit}
                          >
                            <i className="fas fa-times me-2"></i>Cancel
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                              <i className="fas fa-save me-2"></i>
                            )}
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="payment-card home-like hover-card">
                  <div className="card-body">
                    <h5 className="section-title">
                      <i className="fas fa-info-circle me-2"></i>Payment Information
                    </h5>
                    <p className="text-muted">Please fill out the personal information form to proceed with the payment.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={step === 3 ? "col-md-12" : "col-md-6"}>
            <div className="payment-card home-like hover-card">
              <div className="card-body">
                <div className="d-flex justify-content-center mb-4">
                  {[1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`step-indicator mx-2 ${step === index ? 'text-primary' : 'text-muted'}`}
                      onClick={() => step > index && setStep(index)}
                      role="button"
                      tabIndex={step > index ? 0 : -1}
                      onKeyPress={(e) => e.key === 'Enter' && step > index && setStep(index)}
                      aria-label={`Go to step ${index}`}
                    >
                      •
                    </span>
                  ))}
                </div>

                {errorMessage && (
                  <div className="alert alert-danger mb-4" role="alert">
                    {errorMessage}
                  </div>
                )}

                {step === 1 && (
                  <PersonalInfoForm
                    customerInfo={customerInfo}
                    setCustomerInfo={setCustomerInfo}
                    customerErrors={customerErrors}
                    setCustomerErrors={setCustomerErrors}
                    setSubmittedInfo={setSubmittedInfo}
                    setStep={setStep}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setErrorMessage={setErrorMessage}
                  />
                )}
                {step === 2 && (
                  <PaymentMethodForm
                    customerInfo={customerInfo}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    cardDetails={cardDetails}
                    setCardDetails={setCardDetails}
                    cardErrors={cardErrors}
                    setCardErrors={setCardErrors}
                    bankDetails={bankDetails}
                    setBankDetails={setBankDetails}
                    bankErrors={bankErrors}
                    setBankErrors={setBankErrors}
                    submittedInfo={submittedInfo}
                    setSubmittedInfo={setSubmittedInfo}
                    setTransactionDetails={setTransactionDetails}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setErrorMessage={setErrorMessage}
                    setStep={setStep}
                  />
                )}
                {step === 3 && (
                  <PaymentConfirmation
                    customerInfo={customerInfo}
                    transactionDetails={transactionDetails}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PaymentCheckout;