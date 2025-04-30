// server/utils/notifications.js
const Notification = require('../models/NotificationModel');
const axios = require('axios');

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

const markAsRead = async (notificationId) => {
    try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUnread(prev => prev.filter(n => n._id !== notificationId));
        setRead(prev => {
            const notif = unread.find(n => n._id === notificationId);
            return notif ? [{ ...notif, read: true }, ...prev] : prev;
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

const markAllAsRead = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRead(prev => [...unread.map(n => ({ ...n, read: true })), ...prev]);
        setUnread([]);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

const fetchNotifications = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUnread(response.data.unread || []);
        setRead(response.data.read || []);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
    }
};

let filteredNotifications = [];
if (filter === 'all') filteredNotifications = [...unread, ...read];
else if (filter === 'unread') filteredNotifications = unread;
else if (filter === 'read') filteredNotifications = read;

module.exports = { sendNotification, markAsRead, markAllAsRead };
