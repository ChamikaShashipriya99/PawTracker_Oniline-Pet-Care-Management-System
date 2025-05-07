import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import visaIcon from '../assets/visa_icon.jpg';
import mastercardIcon from '../assets/mastercard_icon.jpg';
import './Payment.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentOTPPage from './PaymentOTPPage';
import PaymentConfirmation from './PaymentConfirmation';

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

// Validate card details
const validateCardDetails = (details, field = null) => {
  const errors = field ? {} : {};
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year

  if (!field || field === 'cardType') {
    if (!details.cardType) errors.cardType = 'Card type is required';
    else if (!['visa', 'mastercard'].includes(details.cardType)) errors.cardType = 'Invalid card type';
  }
  if (!field || field === 'nameOnCard') {
    if (!details.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';
    else if (!/^[A-Za-z\s]+$/.test(details.nameOnCard)) errors.nameOnCard = 'Name should contain only letters';
    else if (details.nameOnCard.trim().length < 2) errors.nameOnCard = 'Name is too short';
  }
  if (!field || field === 'cardNumber') {
    const cleaned = details.cardNumber.replace(/\s/g, '');
    if (!cleaned) errors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(cleaned)) errors.cardNumber = 'Card number must be 16 digits';
    else if (details.cardType === 'visa' && !/^4/.test(cleaned)) errors.cardNumber = 'Visa cards must start with 4';
    else if (details.cardType === 'mastercard' && !/^5[1-5]/.test(cleaned)) errors.cardNumber = 'Mastercard must start with 51-55';
  }
  if (!field || field === 'cvv') {
    if (!details.cvv) errors.cvv = 'CVV is required';
    else if (!/^\d{3}$/.test(details.cvv)) errors.cvv = 'CVV must be 3 digits';
  }
  if (!field || field === 'expirationDate') {
    if (!details.expirationDate) errors.expirationDate = 'Expiration date is required';
    else {
      const [month, year] = details.expirationDate.split('/');
      if (!month || !year || month < 1 || month > 12) {
        errors.expirationDate = 'Invalid date format (MM/YY)';
      } else {
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          errors.expirationDate = 'Card has expired';
        }
      }
    }
  }
  return errors;
};

// Validate bank details
const validateBankDetails = (details, field = null) => {
  const errors = field ? {} : {};
  if (!field || field === 'bankName') {
    if (!details.bankName) errors.bankName = 'Bank name is required';
  }
  if (!field || field === 'depositSlip') {
    if (!details.depositSlip) errors.depositSlip = 'Deposit slip is required';
  }
  if (!field || field === 'depositedAmount') {
    if (!details.depositedAmount) errors.depositedAmount = 'Deposited amount is required';
    else if (isNaN(details.depositedAmount) || parseFloat(details.depositedAmount) <= 0) errors.depositedAmount = 'Must be a positive number';
  }
  if (!field || field === 'depositedDate') {
    if (!details.depositedDate) errors.depositedDate = 'Deposited date is required';
    else {
      const depDate = new Date(details.depositedDate);
      const currentDate = new Date();
      if (depDate > currentDate) errors.depositedDate = 'Date cannot be in the future';
    }
  }
  if (!field || field === 'branchName') {
    if (!details.branchName.trim()) errors.branchName = 'Branch name is required';
  }
  return errors;
};

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

const PaymentMethodForm = ({
  customerInfo: propCustomerInfo,
  paymentMethod: propPaymentMethod = 'card',
  setPaymentMethod: propSetPaymentMethod,
  cardDetails: propCardDetails,
  setCardDetails: propSetCardDetails,
  cardErrors: propCardErrors,
  setCardErrors: propSetCardErrors,
  bankDetails: propBankDetails,
  setBankDetails: propSetBankDetails,
  bankErrors: propBankErrors,
  setBankErrors: propSetBankErrors,
  submittedInfo: propSubmittedInfo,
  setSubmittedInfo: propSetSubmittedInfo,
  isLoading: propIsLoading,
  setIsLoading: propSetIsLoading,
  setErrorMessage: propSetErrorMessage,
  setStep: propSetStep,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get customer info from location state if not provided as props
  const customerInfoFromState = location.state?.customerInfo || propCustomerInfo;
  // Use props if provided, otherwise use local state
  const [paymentMethod, setPaymentMethod] = useState(propPaymentMethod);
  const [cardDetails, setCardDetails] = useState(propCardDetails || {
    cardType: '',
    nameOnCard: '',
    cardNumber: '',
    cvv: '',
    expirationDate: '',
  });
  const [cardErrors, setCardErrors] = useState(propCardErrors || {});
  const [bankDetails, setBankDetails] = useState(propBankDetails || {
    bankName: '',
    depositSlip: null,
    depositedAmount: '',
    depositedDate: '',
    branchName: '',
  });
  const [bankErrors, setBankErrors] = useState(propBankErrors || {});
  // Initialize with default values if no props are provided
  const [submittedInfo, setSubmittedInfo] = useState(() => {
    if (propSubmittedInfo) return propSubmittedInfo;
    if (propCustomerInfo) return propCustomerInfo;
    return { amount: 0, purpose: '', email: '', name: '', phone: '', address: '' };
  });
  const [isLoading, setIsLoading] = useState(propIsLoading || false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // If props or location state changes, update local state
  useEffect(() => {
    if (customerInfoFromState && !propSubmittedInfo) {
      setSubmittedInfo({
        ...customerInfoFromState,
        amount: customerInfoFromState.amount || 0, // Provide default amount if not provided
        purpose: customerInfoFromState.purpose || ''
      });
    }
  }, [customerInfoFromState, propSubmittedInfo]);

  // Use submittedInfo directly since we've ensured it's always an object with required fields
  const safeSubmittedInfo = submittedInfo;

  const [isEditing, setIsEditing] = useState(false);
  const [tempCustomerInfo, setTempCustomerInfo] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [transactionDetails, setTransactionDetails] = useState(null);
  const cardFormRef = useRef(null);
  const bankFormRef = useRef(null);
  const editFormRef = useRef(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isEditing && paymentMethod === 'card' && cardFormRef.current) {
      cardFormRef.current.querySelector('input').focus();
    } else if (!isEditing && paymentMethod === 'bank' && bankFormRef.current) {
      bankFormRef.current.querySelector('select').focus();
    } else if (isEditing && editFormRef.current) {
      editFormRef.current.querySelector('input').focus();
    }
  }, [isEditing, paymentMethod]);

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize with all current values
    setTempCustomerInfo({
      name: submittedInfo.name || '',
      email: submittedInfo.email || '',
      phone: submittedInfo.phone || '',
      address: submittedInfo.address || '',
      purpose: submittedInfo.purpose || '',
      amount: submittedInfo.amount || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow changes to email and amount
    if (name === 'email' || name === 'amount') {
      return;
    }

    // Update the state with the new value
    setTempCustomerInfo(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!tempCustomerInfo) return;

    // Validate the form
    const errors = {};
    if (!tempCustomerInfo.name?.trim()) errors.name = 'Name is required';
    if (!tempCustomerInfo.phone) errors.phone = 'Phone number is required';
    if (!tempCustomerInfo.address?.trim()) errors.address = 'Address is required';
    if (!tempCustomerInfo.purpose) errors.purpose = 'Purpose is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error('Please fix the errors in the form.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update only the editable fields
      const updatedInfo = {
        ...submittedInfo,
        name: tempCustomerInfo.name,
        phone: tempCustomerInfo.phone,
        address: tempCustomerInfo.address,
        purpose: tempCustomerInfo.purpose
      };

      // Update the state
      setSubmittedInfo(updatedInfo);
      
      // Reset the edit state
      setIsEditing(false);
      setTempCustomerInfo(null);
      setEditErrors({});

      // Show success message
      toast.success('Personal information updated successfully!');
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('Error updating personal information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nameOnCard') {
      setCardDetails({ ...cardDetails, [name]: value.replace(/[^A-Za-z\s]/g, '') });
    } else if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else if (name === 'cvv') {
      setCardDetails({ ...cardDetails, [name]: value.replace(/\D/g, '').slice(0, 3) });
    } else if (name === 'expirationDate') {
      // Format as MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      }
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const handleBankChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'depositSlip') {
      setBankDetails({ ...bankDetails, [name]: files[0] || null });
    } else if (name === 'depositedAmount') {
      // Prevent changing the deposited amount
      return;
    } else {
      setBankDetails({ ...bankDetails, [name]: value });
    }
  };

  // Add useEffect to set deposited amount when payment method changes to bank
  useEffect(() => {
    if (paymentMethod === 'bank' && submittedInfo.amount) {
      setBankDetails(prev => ({
        ...prev,
        depositedAmount: parseFloat(submittedInfo.amount).toFixed(2)
      }));
    }
  }, [paymentMethod, submittedInfo.amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare payment data
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5);

      const paymentData = {
        transactionId,
        name: submittedInfo.name,
        email: submittedInfo.email,
        phone: submittedInfo.phone,
        address: submittedInfo.address,
        amount: parseFloat(submittedInfo.amount),
        purpose: submittedInfo.purpose,
        payment_method: paymentMethod === 'card' ? 'Card Payment' : 'Bank Transfer',
        status: 'paid',
        ...(user && user._id ? { userId: user._id } : {})
      };

      const response = await axios.post('http://localhost:5000/api/payments', paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message === 'OTP sent successfully') {
        setEmail(response.data.email);
        setShowOTPModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payments/verify-otp', {
        email,
        otp
      });

      if (response.data.message === 'Payment created successfully') {
        toast.success('Payment successful!');
        setShowOTPModal(false);
        
        // Navigate to PaymentConfirmation with payment details
        navigate('/payment-confirmation', {
          state: {
            paymentDetails: {
              amount: submittedInfo.amount,
              paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'Bank Transfer',
              transactionId: response.data.payment?._id || Date.now().toString(),
              date: new Date().toISOString(),
              purpose: submittedInfo.purpose
            },
            customerInfo: submittedInfo
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error verifying OTP');
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

  const bankOptions = [
    { value: '', label: 'Select Bank' },
    { value: "People's Bank", label: "People's Bank" },
    { value: 'Sampath Bank', label: 'Sampath Bank' },
    { value: 'BOC', label: 'BOC' },
    { value: 'Commercial Bank', label: 'Commercial Bank' },
  ];

  return (
    <div className="form-container fade-in">
      <div className="payment-card home-like hover-card">
        <div className="card-body">
          {isEditing ? (
            <form ref={editFormRef} onSubmit={handleSaveEdit} noValidate>
              <h2 className="section-title">
                <i className="fas fa-user-edit me-2"></i>Edit Personal Information
              </h2>
              <FormInput
                label="Name"
                type="text"
                name="name"
                value={tempCustomerInfo?.name || ''}
                onChange={handleEditChange}
                onBlur={() => {
                  if (tempCustomerInfo?.name) {
                    setEditErrors(prev => ({ ...prev, name: null }));
                  }
                }}
                error={editErrors.name}
                required
              />
              <FormInput
                label="Email"
                type="email"
                name="email"
                value={safeSubmittedInfo.email || ''}
                readOnly
                disabled
                className="form-control bg-light"
              />
              <FormInput
                label="Phone"
                type="tel"
                name="phone"
                value={tempCustomerInfo?.phone || ''}
                onChange={handleEditChange}
                onBlur={() => {
                  if (tempCustomerInfo?.phone) {
                    setEditErrors(prev => ({ ...prev, phone: null }));
                  }
                }}
                error={editErrors.phone}
                required
              />
              <FormTextarea
                label="Address"
                name="address"
                value={tempCustomerInfo?.address || ''}
                onChange={handleEditChange}
                onBlur={() => {
                  if (tempCustomerInfo?.address) {
                    setEditErrors(prev => ({ ...prev, address: null }));
                  }
                }}
                error={editErrors.address}
                rows="3"
                required
              />
              <FormSelect
                label="Purpose"
                name="purpose"
                value={tempCustomerInfo?.purpose || ''}
                onChange={handleEditChange}
                onBlur={() => {
                  if (tempCustomerInfo?.purpose) {
                    setEditErrors(prev => ({ ...prev, purpose: null }));
                  }
                }}
                options={purposeOptions}
                error={editErrors.purpose}
                required
              />
              <FormInput
                label="Amount"
                type="number"
                name="amount"
                value={safeSubmittedInfo.amount || 0}
                readOnly
                disabled
                className="form-control bg-light"
              />
              <div className="mt-4 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setTempCustomerInfo(null);
                    setEditErrors({});
                  }}
                  disabled={isLoading}
                >
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fas fa-save me-2"></i>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="section-title">
                Payment Method
              </h2>
              <div className="payment-method-nav">
                <div 
                  className={`nav-item ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <i className="fas fa-credit-card me-2"></i>Card Payment
                </div>
                <div 
                  className={`nav-item ${paymentMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <i className="fas fa-university me-2"></i>Bank Transfer
                </div>
              </div>

              {paymentMethod === 'card' && (
                <form ref={cardFormRef} onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label text-center d-block">Card Type</label>
                    <div className="card-type-selection">
                      <div 
                        className={`card-type-option ${cardDetails.cardType === 'visa' ? 'active' : ''}`}
                        onClick={() => {
                          setCardDetails(prev => ({ ...prev, cardType: 'visa' }));
                          setCardErrors(prev => ({ ...prev, cardType: null }));
                        }}
                      >
                        <img
                          src={visaIcon}
                          alt="Visa"
                          className={`card-image ${cardDetails.cardType === 'visa' ? 'active' : ''}`}
                        />
                        <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="visa"
                          name="cardType"
                          value="visa"
                          checked={cardDetails.cardType === 'visa'}
                          onChange={handleCardChange}
                          onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'cardType'))}
                          aria-label="Visa"
                          required
                        />
                        <label className="form-check-label" htmlFor="visa">
                          Visa
                        </label>
                        </div>
                      </div>
                      <div 
                        className={`card-type-option ${cardDetails.cardType === 'mastercard' ? 'active' : ''}`}
                        onClick={() => {
                          setCardDetails(prev => ({ ...prev, cardType: 'mastercard' }));
                          setCardErrors(prev => ({ ...prev, cardType: null }));
                        }}
                      >
                        <img
                          src={mastercardIcon}
                          alt="Mastercard"
                          className={`card-image ${cardDetails.cardType === 'mastercard' ? 'active' : ''}`}
                        />
                        <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="mastercard"
                          name="cardType"
                          value="mastercard"
                          checked={cardDetails.cardType === 'mastercard'}
                          onChange={handleCardChange}
                          onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'cardType'))}
                          aria-label="Mastercard"
                          required
                        />
                        <label className="form-check-label" htmlFor="mastercard">
                          Mastercard
                        </label>
                        </div>
                      </div>
                    </div>
                    {cardErrors.cardType && <div className="invalid-feedback d-block text-center">{cardErrors.cardType}</div>}
                  </div>
                  <FormInput
                    label="Name on Card"
                    type="text"
                    name="nameOnCard"
                    value={cardDetails.nameOnCard}
                    onChange={handleCardChange}
                    onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'nameOnCard'))}
                    error={cardErrors.nameOnCard}
                    pattern="[A-Za-z\s]+"
                    title="Only letters allowed"
                    required
                  />
                  <FormInput
                    label="Card Number"
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'cardNumber'))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    error={cardErrors.cardNumber}
                    maxLength="19"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    required
                  />
                  <div className="row">
                    <div className="col-md-6">
                      <FormInput
                        label="CVV"
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'cvv'))}
                        placeholder="xxx"
                        error={cardErrors.cvv}
                        maxLength="3"
                        inputMode="numeric"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <FormInput
                        label="Expiration Date"
                        type="text"
                        name="expirationDate"
                        value={cardDetails.expirationDate}
                        onChange={handleCardChange}
                        onBlur={() => setCardErrors(validateCardDetails(cardDetails, 'expirationDate'))}
                        placeholder="MM/YY"
                        error={cardErrors.expirationDate}
                        maxLength="5"
                        inputMode="numeric"
                        pattern="\d{2}/\d{2}"
                        title="Enter date in MM/YY format"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-check me-2"></i>
                      )}
                      Pay Now
                    </button>
                  </div>
                </form>
              )}

              {paymentMethod === 'bank' && (
                <form ref={bankFormRef} onSubmit={handleSubmit} noValidate>
                  <FormSelect
                    label="Bank Name"
                    name="bankName"
                    value={bankDetails.bankName}
                    onChange={handleBankChange}
                    onBlur={() => setBankErrors(validateBankDetails(bankDetails, 'bankName'))}
                    options={bankOptions}
                    error={bankErrors.bankName}
                    required
                  />
                  <FormInput
                    label="Branch Name"
                    type="text"
                    name="branchName"
                    value={bankDetails.branchName}
                    onChange={handleBankChange}
                    onBlur={() => setBankErrors(validateBankDetails(bankDetails, 'branchName'))}
                    error={bankErrors.branchName}
                    required
                  />
                  <FormInput
                    label="Deposited Amount"
                    type="number"
                    name="depositedAmount"
                    value={bankDetails.depositedAmount}
                    onChange={handleBankChange}
                    onBlur={() => setBankErrors(validateBankDetails(bankDetails, 'depositedAmount'))}
                    error={bankErrors.depositedAmount}
                    min="0.01"
                    step="0.01"
                    required
                    readOnly
                    disabled
                  />
                  <FormInput
                    label="Deposited Date"
                    type="date"
                    name="depositedDate"
                    value={bankDetails.depositedDate}
                    onChange={handleBankChange}
                    onBlur={() => setBankErrors(validateBankDetails(bankDetails, 'depositedDate'))}
                    placeholder="Select date"
                    max={new Date().toISOString().split('T')[0]}
                    error={bankErrors.depositedDate}
                    required
                  />
                  <div className="mb-3">
                    <label className="form-label">Upload Deposit Slip (Image)</label>
                    <input
                      type="file"
                      className={`form-control ${bankErrors.depositSlip ? 'is-invalid' : ''}`}
                      name="depositSlip"
                      onChange={handleBankChange}
                      onBlur={() => setBankErrors(validateBankDetails(bankDetails, 'depositSlip'))}
                      accept="image/*"
                      placeholder="Upload an image"
                      aria-label="Upload Deposit Slip"
                      required
                    />
                    {bankDetails.depositSlip && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(bankDetails.depositSlip)}
                          alt="Deposit Slip Preview"
                          className="img-preview"
                        />
                      </div>
                    )}
                    {bankErrors.depositSlip && <div className="invalid-feedback">{bankErrors.depositSlip}</div>}
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-check me-2"></i>
                      )}
                      Pay Now
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
      {showOTPModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter OTP</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowOTPModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Please enter the OTP sent to your email ({email})</p>
                <input
                  type="text"
                  className="form-control"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength="6"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowOTPModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleOTPVerification}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodForm;
//123456789