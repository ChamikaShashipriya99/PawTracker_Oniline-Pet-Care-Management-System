import React, { useEffect } from 'react';

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
        <div className={`notification notification-${type}`}>
            {message}
        </div>
    );
}

export default Notification;