// server/utils/notifications.js
const Notification = require('../models/NotificationModel');

const sendNotification = async (recipient, title, message, data = {}) => {
    try {
        await Notification.create({
            recipient,
            title,
            message,
            data,
        });
        console.log(`Notification sent to ${recipient}: ${title} - ${message}`);
        // Future enhancement: Add logic to send email or push notification
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = { sendNotification };