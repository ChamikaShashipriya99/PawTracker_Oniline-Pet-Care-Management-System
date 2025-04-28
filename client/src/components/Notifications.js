// client/src/pages/Notifications.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Service.css';

function Notifications({ recipient }) { // Pass recipient as a prop (e.g., "admin" or petOwner name)
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`/api/notifications?recipient=${recipient}`);
                setNotifications(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [recipient]);

    if (loading) {
        return (
            <div className="service-container">
                <p className="text-center py-5 fade-in">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="service-container">
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Notifications 🔔</h1>
                    <p className="hero-subtitle">View your recent notifications.</p>
                </div>
            </section>
            <section className="content-section fade-in">
                <div className="container">
                    {notifications.length === 0 ? (
                        <p className="text-center py-5">No notifications found.</p>
                    ) : (
                        <div className="card hover-card">
                            <div className="card-body">
                                <ul className="notification-list">
                                    {notifications.map((notification) => (
                                        <li key={notification._id} className="notification-item">
                                            <h3>{notification.title}</h3>
                                            <p>{notification.message}</p>
                                            <small>{new Date(notification.createdAt).toLocaleString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Notifications;