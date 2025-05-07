import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Payment.css';

// Reusable Input Component
const FormInput = ({ label, type, name, value, onChange, onBlur, placeholder, error, pattern, title, maxLength, required, ...props }) => (
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
      pattern={pattern}
      title={title}
      maxLength={maxLength}
      aria-label={label}
      required={required}
      {...props}
    />
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

// Reusable Textarea Component
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

// Reusable Select Component
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

// Validation Function
const validateCustomerInfo = (info, field = null) => {
  const errors = {};
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

const PersonalInfoForm = ({
  customerInfo,
  setCustomerInfo,
  customerErrors,
  setCustomerErrors,
  setSubmittedInfo,
  setStep,
  isLoading,
  setIsLoading,
  setErrorMessage,
}) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.querySelector('input').focus();
    }

    // Set email from logged-in user
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setCustomerInfo({ ...customerInfo, [name]: value.replace(/[^A-Za-z\s]/g, '') });
    } else if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10 && (cleaned === '' || cleaned[0] === '0')) {
        setCustomerInfo({ ...customerInfo, [name]: cleaned });
      }
    } else if (name !== 'email') { // Prevent email changes
      setCustomerInfo({ ...customerInfo, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCustomerInfo(customerInfo);
    setCustomerErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    try {
      setIsLoading(true);
      const mockResponse = { data: { transactionId: `TXN-${Date.now()}` } };
      setSubmittedInfo({ ...customerInfo, transactionId: mockResponse.data.transactionId });
      setStep(2);
      toast.success('Personal information submitted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Error creating payment. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const purposeOptions = [
    { value: '', label: 'Select Purpose' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'store_purchase', label: 'Store Purchase' },
    { value: 'veterinary_service', label: 'Veterinary Service' },
    { value: 'grooming_service', label: 'Grooming Service' },
    { value: 'training_service', label: 'Training Service' },
  ];

  return (
    <div className="form-container fade-in">
      <div className="payment-card home-like hover-card">
        <div className="card-body">
          <h2 className="section-title">
            <i className="fas fa-user me-2"></i>Personal Information
          </h2>
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <FormInput
              label={<><i className="fas fa-user me-2"></i>Full Name</>}
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'name'))}
              error={customerErrors.name}
              pattern="[A-Za-z\s]+"
              title="Only letters allowed"
              required
            />
            <FormInput
              label={<><i className="fas fa-envelope me-2"></i>Email</>}
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'email'))}
              error={customerErrors.email}
              required
              readOnly
              style={{ backgroundColor: '#e9ecef' }}
            />
            <FormInput
              label={<><i className="fas fa-phone me-2"></i>Phone</>}
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'phone'))}
              error={customerErrors.phone}
              maxLength="10"
              pattern="0\d{9}"
              title="Must start with 0 and have 10 digits"
              required
            />
            <FormTextarea
              label={<><i className="fas fa-map-marker-alt me-2"></i>Address</>}
              name="address"
              value={customerInfo.address}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'address'))}
              error={customerErrors.address}
              rows="2"
              required
            />
            <FormSelect
              label={<><i className="fas fa-tasks me-2"></i>Purpose</>}
              name="purpose"
              value={customerInfo.purpose}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'purpose'))}
              options={purposeOptions}
              error={customerErrors.purpose}
              required
            />
            <FormInput
              label={<><i className="fas fa-dollar-sign me-2"></i>Amount</>}
              type="number"
              name="amount"
              value={customerInfo.amount}
              onChange={handleChange}
              onBlur={() => setCustomerErrors(validateCustomerInfo(customerInfo, 'amount'))}
              error={customerErrors.amount}
              min="0.01"
              step="0.01"
              required
            />
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-arrow-right me-2"></i>
                )}
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;

