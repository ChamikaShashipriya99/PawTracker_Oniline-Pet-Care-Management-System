import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Service.css';

const Notifications = () => {
    const [unread, setUnread] = useState([]);
    const [read, setRead] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

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

    let filteredNotifications = [];
    if (filter === 'all') filteredNotifications = [...unread, ...read];
    else if (filter === 'unread') filteredNotifications = unread;
    else if (filter === 'read') filteredNotifications = read;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return <div className="loading">Loading notifications...</div>;
    }

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1>Notifications</h1>
                <div className="notifications-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>
                    <button
                        className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </button>
                    {unread.length > 0 && (
                        <button className="mark-all-read-btn" onClick={markAllAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="no-notifications">No notifications found</div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className="notification-content">
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {formatDate(notification.createdAt)}
                                </span>
                            </div>
                            {!notification.read && (
                                <div className="notification-status">
                                    <span className="unread-dot"></span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
