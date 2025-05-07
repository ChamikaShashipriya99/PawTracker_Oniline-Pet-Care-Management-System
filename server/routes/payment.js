const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authAdmin');

// Create payment (now sends OTP)
router.post('/', paymentController.createPayment);

// Verify OTP and create payment
router.post('/verify-otp', paymentController.verifyOTPAndCreatePayment);

// Get user payments
router.get('/user', authenticate, paymentController.getUserPayments);

// Get all payments (admin only)
router.get('/all', authenticate, paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', authenticate, paymentController.getPaymentById);

// Update payment status
router.patch('/:id/status', authenticate, paymentController.updatePaymentStatus);

// Delete payment
router.delete('/:id', authenticate, paymentController.deletePayment);

module.exports = router;