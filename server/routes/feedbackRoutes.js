const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Create new feedback
router.post('/', auth, async (req, res) => {
    try {
        const feedback = new Feedback({
            ...req.body,
            user: req.user._id
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all feedback (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const feedbacks = await Feedback.find().populate('user', 'name email');
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get feedback by user
router.get('/my-feedback', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user._id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update feedback status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        feedback.status = req.body.status;
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add admin reply (admin only)
router.post('/:id/reply', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        
        feedback.adminReply = {
            message: req.body.message,
            repliedAt: new Date()
        };
        
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update feedback
router.patch('/:id', auth, async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user._id });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        Object.assign(feedback, req.body);
        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete feedback
router.delete('/:id', auth, async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user._id });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        await feedback.remove();
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 