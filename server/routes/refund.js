const express = require('express');
const router = express.Router();
const { 
  createRefund, 
  getUserRefunds, 
  getAllRefunds, 
  getRefundNotifications,
  approveRefund,
  rejectRefund
} = require('../Controllers/refundController');
const { authenticate, isAdmin } = require('../middleware/authAdmin');

// User routes
router.post('/request', authenticate, createRefund);
router.get('/user', authenticate, getUserRefunds);
router.get('/notifications', authenticate, getRefundNotifications);

// Admin routes (protected with authentication and admin check)
router.get('/admin', authenticate, getAllRefunds);
router.post('/approve/:id', authenticate, approveRefund);
router.post('/reject/:id', authenticate, rejectRefund);

module.exports = router;