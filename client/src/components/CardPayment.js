import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CardPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId;

  const [paymentData, setPaymentData] = useState({
    transactionId,
    cardType: '',
    nameOnCard: '',
    cardNumber: '',
    cvv: '',
    expirationDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get current month and year in YYYY-MM format
  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const handleCardNumberChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = cleanedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleCVVChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\D/g, '').slice(0, 3);
    setPaymentData(prev => ({ ...prev, [name]: cleanedValue }));
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/[^A-Za-z\s]/g, '');
    setPaymentData(prev => ({ ...prev, [name]: cleanedValue }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const currentDate = new Date();
    const currentMonthYear = getCurrentMonthYear();
    
    if (!paymentData.cardType) {
      newErrors.cardType = 'Card type is required';
    } else if (!['visa', 'mastercard'].includes(paymentData.cardType)) {
      newErrors.cardType = 'Invalid card type';
    }

    if (!paymentData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required';
    } else if (!/^[A-Za-z\s]+$/.test(paymentData.nameOnCard)) {
      newErrors.nameOnCard = 'Name should contain only letters';
    } else if (paymentData.nameOnCard.trim().length < 2) {
      newErrors.nameOnCard = 'Name is too short';
    }

    const cleanedCardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    } else if (paymentData.cardType === 'visa' && !/^4/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Visa cards must start with 4';
    } else if (paymentData.cardType === 'mastercard' && !/^5[1-5]/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Mastercard must start with 51-55';
    }

    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3}$/.test(paymentData.cvv)) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    if (!paymentData.expirationDate) {
      newErrors.expirationDate = 'Expiration date is required';
    } else {
      const [year, month] = paymentData.expirationDate.split('-');
      
      // Validate the date structure
      if (!year || !month || month < 1 || month > 12) {
        newErrors.expirationDate = 'Invalid date format';
      } else {
        const expDate = new Date(parseInt(year), parseInt(month) - 1);
        
        // Compare with current date (first day of next month to match credit card expiration rules)
        const compareDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        
        if (expDate < compareDate) {
          newErrors.expirationDate = 'Card has expired or will expire this month';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...paymentData,
        cardNumber: paymentData.cardNumber.replace(/\s/g, '')
      };

      const response = await axios.post(
        'http://localhost:5000/api/payments/card-payment', 
        submissionData
      );
      
      if (response.status === 200) {
        navigate('/payment-success', { 
          state: { transactionId } 
        });
      }
    } catch (error) {
      console.error('Card payment error:', error);
      if (error.response) {
        alert(error.response.data.message || 'Payment processing failed');
      } else if (error.request) {
        alert('Network error - please check your connection');
      } else {
        alert('Error processing payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="mb-4 text-center">Card Payment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label d-block text-start w-100">Card Type</label>
            <div className="d-flex justify-content-start">
              <div className="form-check me-3">
                <input 
                  type="radio" 
                  className="form-check-input" 
                  id="visa" 
                  name="cardType" 
                  value="visa"
                  checked={paymentData.cardType === 'visa'}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label" htmlFor="visa">Visa</label>
              </div>
              <div className="form-check">
                <input 
                  type="radio" 
                  className="form-check-input" 
                  id="mastercard" 
                  name="cardType" 
                  value="mastercard"
                  checked={paymentData.cardType === 'mastercard'}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label" htmlFor="mastercard">Mastercard</label>
              </div>
            </div>
            {errors.cardType && <div className="text-danger text-start">{errors.cardType}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label d-block text-start w-100">Name on Card</label>
            <input 
              type="text" 
              className={`form-control ${errors.nameOnCard ? 'is-invalid' : ''}`}
              name="nameOnCard"
              value={paymentData.nameOnCard}
              onChange={handleNameChange}
              pattern="[A-Za-z\s]+"
              title="Only letters allowed"
              required
            />
            {errors.nameOnCard && <div className="invalid-feedback text-start">{errors.nameOnCard}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label d-block text-start w-100">Card Number</label>
            <input 
              type="text" 
              className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
              inputMode="numeric"
              autoComplete="cc-number"
              required
            />
            {errors.cardNumber && <div className="invalid-feedback text-start">{errors.cardNumber}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label d-block text-start w-100">CVV</label>
              <input 
                type="text" 
                className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                name="cvv"
                value={paymentData.cvv}
                onChange={handleCVVChange}
                maxLength="3"
                placeholder="•••"
                inputMode="numeric"
                autoComplete="off"
                required
              />
              {errors.cvv && <div className="invalid-feedback text-start">{errors.cvv}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label d-block text-start w-100">Expiration Date</label>
              <input 
                type="month" 
                className={`form-control ${errors.expirationDate ? 'is-invalid' : ''}`}
                name="expirationDate"
                placeholder="YYYY-MM"
                value={paymentData.expirationDate}
                onChange={handleChange}
                min={getCurrentMonthYear()}
                required
              />
              {errors.expirationDate && <div className="invalid-feedback text-start">{errors.expirationDate}</div>}
            </div>
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

export default CardPayment;
