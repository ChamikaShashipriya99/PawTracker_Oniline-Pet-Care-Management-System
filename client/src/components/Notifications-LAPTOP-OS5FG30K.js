import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Notifications = ({ recipient }) => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/${recipient}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [recipient]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${recipient}/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Notifications</h4>
              {notifications.some(n => !n.isRead) && (
                <button 
                  className="btn btn-sm btn-light" 
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </button>
              )}
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
                          {notification.type === 'appointment' ? '📅' : 
                           notification.type === 'reminder' ? '⏰' : '🔔'}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-1">{notification.message}</p>
                          <small className="text-muted">
                            {formatDate(notification.createdAt)}
                          </small>
                          {notification.appointmentId && (
                            <div className="mt-2">
                              <Link 
                                to={`/view-appointment/${notification.appointmentId}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Appointment
                              </Link>
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <button 
                            className="btn btn-sm btn-link text-primary" 
                            onClick={() => markAsRead(notification._id)}
                          >
                            Mark as Read
                          </button>
                        )}
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