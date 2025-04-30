// server/controllers/notificationController.js
const NotificationModel = require('../models/NotificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.find({ recipient: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};