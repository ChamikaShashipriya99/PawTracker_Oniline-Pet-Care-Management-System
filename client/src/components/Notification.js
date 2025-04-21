// client/src/components/Notification.js
import React, { useEffect } from 'react';
import './Service.css'; // Import Service.css for shared styles

function Notification({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification notification-${type} fade-in`}>
            <span className="notification-message">{message}</span>
            {onClose && (
                <button className="notification-close" onClick={onClose}>
                    ✕
                </button>
            )}
        </div>
    );
}

export default Notification;