// client/src/components/Notification.js
import React, { useEffect, useState } from 'react';
import './Service.css';

function Notification({ message, type = 'success', onClose }) {
    const [isVisible, setIsVisible] = useState(true); // Track visibility for fade-out

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false); // Trigger fade-out
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isVisible && onClose) {
            const fadeOutTimer = setTimeout(() => {
                onClose(); // Call onClose after fade-out animation completes
            }, 300); // Match the CSS fade-out duration
            return () => clearTimeout(fadeOutTimer);
        }
    }, [isVisible, onClose]);

    const handleClose = () => {
        setIsVisible(false); // Trigger fade-out on manual close
    };

    return (
        <div
            className={`notification notification-${type} ${isVisible ? 'fade-in' : 'fade-out'}`}
            role="alert"
            aria-live="assertive"
        >
            <span className="notification-message">{message}</span>
            {onClose && (
                <button
                    className="notification-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default Notification;