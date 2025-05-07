const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');

exports.createPayment = async (req, res) => {
  try {
    const { transactionId, name, email, phone, address, amount, purpose, payment_method, status, userId } = req.body;

    if (!transactionId || !name || !email || !phone || !address || !amount || !purpose || !payment_method || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      paymentData: {
        transactionId,
        name,
        email,
        phone,
        address,
        amount,
        purpose,
        payment_method,
        status,
        ...(userId ? { userId } : {})
      }
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Payment Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Verification OTP</h2>
          <p>Your OTP for payment verification is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOTPAndCreatePayment = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    
    if (Date.now() > storedData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Debug: Log payment data before saving
    console.log('About to save payment:', storedData.paymentData);

    // Use a default or dummy userId if not present
    let paymentData = { ...storedData.paymentData, paymentDate: new Date() };
    if (!paymentData.userId) {
      // Use a fixed dummy ObjectId (24 hex chars) for guest payments
      paymentData.userId = '000000000000000000000000';
    }

    // Create payment after OTP verification
    const payment = new Payment(paymentData);

    try {
      await payment.save();
    } catch (validationError) {
      console.error('Payment validation error:', validationError);
      return res.status(400).json({ message: 'Payment validation error', error: validationError.message });
    }
    
    // Clear OTP and payment data after successful verification
    otpStore.delete(email);
    
    res.status(201).json({ 
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const userId = req.user.userId;
    console.log('getUserPayments called:', { startDate, endDate, status, userId });

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({ message: 'User ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const query = { userId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('Invalid date format');
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.paymentDate = { $gte: start, $lte: end };
    } else if (startDate) {
      query.paymentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.paymentDate = { $lte: new Date(endDate) };
    }

    if (status) {
      if (!['paid', 'failed'].includes(status.toLowerCase())) {
        console.log('Invalid status value');
        return res.status(400).json({ message: 'Invalid status value. Use paid or failed' });
      }
      query.status = status.toLowerCase();
    }

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    const refunds = await Refund.find({ userId }).select('transactionId status actionDate adminComment');

    const paymentsWithRefunds = payments.map(payment => {
      const refund = refunds.find(r => r.transactionId === payment.transactionId);
      return {
        ...payment._doc,
        refundStatus: refund ? refund.status : 'none',
        refundDecisionDate: refund ? refund.actionDate : null,
        adminComment: refund ? refund.adminComment : null,
        isRefundEligible: payment.status === 'paid' && !refund
      };
    });

    console.log('Payments retrieved:', paymentsWithRefunds.length);
    res.status(200).json(paymentsWithRefunds);
  } catch (error) {
    console.error('getUserPayments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPaymentReport = async (req, res) => {
  try {
    const payments = await Payment.find();
    const report = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalPayments: payments.length,
      statusBreakdown: report
    });
  } catch (error) {
    console.error('getPaymentReport error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('getAllPayments query:', { startDate, endDate });

    const query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('Invalid date format');
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.paymentDate = { $gte: start, $lte: end };
    } else if (startDate) {
      query.paymentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.paymentDate = { $lte: new Date(endDate) };
    }

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    console.log('Admin payments retrieved:', payments.length);
    res.status(200).json(payments);
  } catch (error) {
    console.error('getAllPayments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPaymentMethodOptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching payment method options for user:', userId);

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({ message: 'User ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const paymentMethods = await Payment.distinct('payment_method', { userId });
    console.log('Payment method options retrieved:', paymentMethods);
    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error('getPaymentMethodOptions error:', error);
    res.status(500).json({ message: 'Failed to fetch payment method options', error: error.message });
  }
};

// Generate and send OTP
exports.generateAndSendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Payment Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Verification OTP</h2>
          <p>Your OTP for payment verification is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    
    if (Date.now() > storedData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Clear OTP after successful verification
    otpStore.delete(email);
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// Get payment by ID (updated to fix CastError)
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error('getPaymentById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.status = req.body.status;
    await payment.save();
    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('deletePayment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
//1234