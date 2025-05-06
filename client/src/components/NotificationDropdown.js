import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification._id);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const handleToggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
        <a 
          className="nav-link position-relative" 
          href="#" 
          onClick={handleToggleDropdown}
        >
          <i className="fas fa-bell fa-lg"></i>
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount}
              <span className="visually-hidden">unread notifications</span>
            </span>
          )}
        </a>
        
        {isOpen && (
          <div className="dropdown-menu dropdown-menu-end show" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <h6 className="mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-link btn-sm text-decoration-none p-0" 
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-3 text-center text-muted">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`dropdown-item p-2 ${!notification.read ? 'bg-light' : ''}`}
                  onClick={(e) => handleNotificationClick(notification, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="fw-bold">{notification.title}</div>
                      <div className="small text-muted">{notification.message}</div>
                      <div className="small text-muted">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {notifications.length > 0 && (
              <div className="p-2 border-top text-center">
                <Link to="/notifications" className="btn btn-link btn-sm text-decoration-none">
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default NotificationDropdown;