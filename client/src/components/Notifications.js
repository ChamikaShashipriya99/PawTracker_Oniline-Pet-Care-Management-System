import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { notifications, markAllAsRead, loading } = useNotifications();

  useEffect(() => {
    // Mark all notifications as read when viewing the page
    if (notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, [notifications, markAllAsRead]);

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

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Notifications</h4>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No notifications</p>
                </div>
              ) : (
                <div className="list-group">
                  {notifications.map(notification => (
                    <div 
                      key={notification._id}
                      className={`list-group-item list-group-item-action ${!notification.isRead ? 'bg-light' : ''}`}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-1">{notification.message}</p>
                          <small className="text-muted">
                            {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                          </small>
                          {notification.appointmentId && (
                            <div className="mt-2">
                              <Link 
                                to={`/my-appointments`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Appointment
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 