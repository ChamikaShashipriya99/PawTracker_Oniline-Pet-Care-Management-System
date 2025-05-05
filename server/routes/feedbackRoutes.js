import express from 'express';
import Feedback from '../models/Feedback.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Create new feedback
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received feedback:', req.body);
        const feedback = new Feedback({
            ...req.body
        });
        await feedback.save();
        console.log('Saved feedback:', feedback);
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all feedback (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        // Check if user exists and is admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const feedbacks = await Feedback.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching all feedback:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get feedback by user
router.get('/my-feedback', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.id })
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
        // Check if user exists and is admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        feedback.status = req.body.status;
        await feedback.save();

        // Populate user data before sending response
        const updatedFeedback = await Feedback.findById(feedback._id)
            .populate('user', 'name email');
            
        res.json(updatedFeedback);
    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(400).json({ message: error.message });
    }
});

// Add admin reply (admin only)
router.post('/:id/reply', auth, async (req, res) => {
    try {
        // Check if user exists and is admin
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
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
        
        // Populate user data before sending response
        const updatedFeedback = await Feedback.findById(feedback._id)
            .populate('user', 'name email');
            
        res.json(updatedFeedback);
    } catch (error) {
        console.error('Error adding admin reply:', error);
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
        const feedback = await Feedback.findOne({ 
            _id: req.params.id,
            user: req.user.id  // Changed from req.user._id to req.user.id
        });
        
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router; 