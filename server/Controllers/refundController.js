const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'samankumara990209@gmail.com',
    pass: process.env.EMAIL_PASS || 'lbcyivjbrwnktwgk'
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 5,
  rateLimit: 10,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer transporter verification failed:', {
      message: error.message,
      code: error.code,
      response: error.response || 'No response'
    });
  } else {
    console.log('Nodemailer transporter is ready to send emails');
  }
});

// Email sending function
const sendEmail = async (to, subject, message, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mailOptions = {
        from: `Pet Care System <${process.env.EMAIL_USER || 'samankumara990209@gmail.com'}>`,
        to: to,
        subject: subject,
        text: message
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId} (Attempt ${attempt})`);
      return info;
    } catch (error) {
      console.error(`Error sending email to ${to} (Attempt ${attempt}/${retries}):`, {
        message: error.message,
        code: error.code,
        response: error.response || 'No response',
        stack: error.stack
      });
      if (attempt < retries) {
        console.log(`Retrying email after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        console.error(`Failed to send email to ${to} after ${retries} attempts. Logging email content:`, {
          to, subject, message
        });
        return null;
      }
    }
  }
};

const otps = {}; // In-memory store for demo; use DB/Redis for production

exports.createRefund = async (req, res) => {
  console.log('Received refund request:', req.body);
  try {
    const { transactionId, amount, reason, email, userId } = req.body;
    console.log('Extracted fields:', { transactionId, amount, reason, email, userId });

    const authUserId = req.user.userId;
    if (!userId || !authUserId || userId !== authUserId) {
      console.log('Missing or invalid userId');
      return res.status(401).json({ message: 'Invalid or unauthorized user ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!transactionId || !amount || !reason || !email) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Transaction ID, amount, reason, and email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const payment = await Payment.findOne({ transactionId, userId });
    if (!payment) {
      console.log('Payment not found or does not belong to user');
      return res.status(404).json({ message: 'Payment not found or does not belong to user' });
    }

    const existingRefund = await Refund.findOne({ transactionId });
    if (existingRefund) {
      console.log('Refund already requested for this transaction');
      return res.status(400).json({ message: 'Refund already requested for this transaction' });
    }

    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const refund = new Refund({
      userId,
      refundId,
      transactionId,
      amount,
      email,
      reason,
      status: 'pending'
    });

    await refund.save();
    console.log(`Refund saved: ${refund}`);
    res.status(201).json({ message: 'Refund request submitted successfully', refund });
  } catch (error) {
    console.error('Create refund error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Refund already requested for this transaction' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserRefunds = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const userId = req.user.userId;
    console.log('getUserRefunds query:', { startDate, endDate, status, userId });

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
      query.requestDate = { $gte: start, $lte: end };
    } else if (startDate) {
      query.requestDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.requestDate = { $lte: new Date(endDate) };
    }

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status.toLowerCase())) {
        console.log('Invalid status value');
        return res.status(400).json({ message: 'Invalid status value. Use pending, approved, or rejected' });
      }
      query.status = status.toLowerCase();
    }

    const refunds = await Refund.find(query).sort({ requestDate: -1 });
    console.log(`Refunds retrieved: ${refunds.length}`);
    res.status(200).json(refunds);
  } catch (error) {
    console.error('getUserRefunds error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllRefunds = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('getAllRefunds query:', { startDate, endDate });

    const query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('Invalid date format');
        return res.status(400).json({ message: 'Invalid date format' });
      }
      query.createdAt = { $gte: start, $lte: end };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }

    const refunds = await Refund.find(query).sort({ createdAt: -1 });
    console.log(`Admin refunds retrieved: ${refunds.length}`);
    res.status(200).json(refunds);
  } catch (error) {
    console.error('getAllRefunds error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRefundNotifications = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.userId;
    let lastChecked = req.query.lastChecked;
    console.log('getRefundNotifications query:', { userId, lastChecked });

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({ message: 'User ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid userId format');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (lastChecked) {
      lastChecked = new Date(lastChecked);
      if (isNaN(lastChecked.getTime())) {
        console.log('Invalid lastChecked format');
        return res.status(400).json({ message: 'Invalid lastChecked format' });
      }
    } else {
      lastChecked = new Date(0);
    }

    const refunds = await Refund.find({
      userId,
      $or: [
        { updatedAt: { $gt: lastChecked } },
        { actionDate: { $gt: lastChecked, $exists: true } }
      ],
      status: { $in: ['approved', 'rejected'] }
    }).sort({ updatedAt: -1 });

    console.log(`Refund notifications retrieved: ${refunds.length}`);
    res.status(200).json(refunds);
  } catch (error) {
    console.error('getRefundNotifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      console.log(`Refund not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Refund not found' });
    }

    refund.status = 'approved';
    refund.actionDate = new Date();
    refund.adminComment = req.body.adminComment || '';
    await refund.save();

    console.log(`Refund approved: ${refund._id}`);
    res.status(200).json({ message: 'Refund approved successfully', refund });
  } catch (error) {
    console.error('Error approving refund:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to approve refund', error: error.message });
  }
};

exports.rejectRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      console.log(`Refund not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Refund not found' });
    }

    refund.status = 'rejected';
    refund.actionDate = new Date();
    refund.adminComment = req.body.adminComment || '';
    await refund.save();

    console.log(`Refund rejected: ${refund._id}`);
    res.status(200).json({ message: 'Refund rejected successfully', refund });
  } catch (error) {
    console.error('Error rejecting refund:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Failed to reject refund', error: error.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = otp;
  await sendEmail(email, 'Your Payment OTP', `Your OTP is: ${otp}`);
  res.json({ success: true });
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] && otps[email] === otp) {
    delete otps[email];
    return res.json({ success: true });
  }
  res.json({ success: false });
};