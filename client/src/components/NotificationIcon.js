import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Service.css';

const NotificationIcon = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:5000/api/notifications/unread/count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    const handleClick = () => {
        navigate('/notifications');
    };

    return (
        <div className="notification-icon" onClick={handleClick}>
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
            )}
        </div>
    );
};

export default NotificationIcon; 