import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentStatus = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const transactionId = location.state?.transactionId;
        
        if (!transactionId) {
          navigate('/payment');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/payments/status/${transactionId}`)
        setPaymentDetails(response.data.payment);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment status:', error);
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [location, navigate]);

  const handleEdit = () => {
    navigate(`/update/${paymentDetails.transactionId}`, { 
      state: { paymentDetails } 
    });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/payments/delete/${paymentDetails.transactionId}`);
      navigate('/payment');
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleCardPayment = () => {
    navigate('/card-payment', { 
      state: { transactionId: paymentDetails.transactionId } 
    });
  };

  const handleBankTransfer = () => {
    navigate('/bank-transfer', { 
      state: { transactionId: paymentDetails.transactionId } 
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      {paymentDetails && (
        <div className="card shadow-lg" style={{ width: '600px', margin: '2rem 0' }}>
          <div className="card-header bg-primary text-white">
            <h2 className="text-center mb-0">Payment Status</h2>
          </div>
          <div className="card-body text-center">
            <h5 className="card-title mb-4">Transaction ID: {paymentDetails.transactionId}</h5>
            
            <div className="mx-auto" style={{ width: '80%', textAlign: 'left' }}>
              <p className="mb-3"><strong>Name:</strong> {paymentDetails.name}</p>
              <p className="mb-3"><strong>Email:</strong> {paymentDetails.email}</p>
              <p className="mb-3"><strong>Phone:</strong> {paymentDetails.phone}</p>
              <p className="mb-3"><strong>Address:</strong> {paymentDetails.address}</p>
              <p className="mb-3"><strong>Purpose:</strong> {paymentDetails.purpose}</p>
              <p className="mb-3"><strong>Amount:</strong> ${paymentDetails.amount?.$numberDecimal || paymentDetails.amount}</p>
              <p className="mb-4"><strong>Status:</strong> {paymentDetails.status}</p>
            </div>

            <div className="mt-4">
              <button 
                className="btn btn-primary me-3" 
                onClick={handleEdit}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger me-3" 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>

            <div className="mt-5">
              <button 
                className="btn btn-success me-3" 
                onClick={handleCardPayment}
              >
                Card Payment
              </button>
              <button 
                className="btn btn-info" 
                onClick={handleBankTransfer}
              >
                Bank Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;

