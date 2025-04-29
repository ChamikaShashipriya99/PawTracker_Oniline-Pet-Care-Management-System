import React from 'react';
import './Service.css';

const Notification = ({ message, onClose }) => {
    return (
        <div className="notification notification-success">
            <span className="notification-message">{message}</span>
            <button className="notification-close" onClick={onClose}>
                &times;
            </button>
        </div>
    );
};

export default Notification;