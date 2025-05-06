import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping notification fetch');
        return;
      }

      console.log('Fetching notifications...');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 
          'Authorization': token,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Notifications API response:', response);
      
      // Handle the response format with unread and read arrays
      let notificationsData = [];
      let unreadCount = 0;
      
      if (response.data && typeof response.data === 'object') {
        // Handle the format: { unread: [...], read: [...] }
        const unread = Array.isArray(response.data.unread) ? response.data.unread : [];
        const read = Array.isArray(response.data.read) ? response.data.read : [];
        
        // Combine and add read status to each notification
        notificationsData = [
          ...unread.map(n => ({ ...n, read: false })),
          ...read.map(n => ({ ...n, read: true }))
        ];
        
        unreadCount = unread.length;
        
        console.log(`Found ${unreadCount} unread and ${read.length} read notifications`);
      } else if (Array.isArray(response.data)) {
        // Fallback for array response
        notificationsData = response.data;
        unreadCount = notificationsData.filter(n => !n.read).length;
      }
      
      console.log('Processed notifications:', notificationsData);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Status code:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    console.log('Marking notification as read:', notificationId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get the notification before updating
      const notificationToUpdate = notifications.find(n => n._id === notificationId);
      if (!notificationToUpdate) {
        console.error('Notification not found:', notificationId);
        return;
      }

      console.log('Notification before update:', notificationToUpdate);

      // Optimistically update the UI
      setNotifications(prev => {
        const updated = prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        console.log('Updated notifications:', updated);
        return updated;
      });
      
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - (notificationToUpdate.read ? 0 : 1));
        console.log('Updated unread count:', newCount);
        return newCount;
      });

      // Make the API call
      const response = await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { 
          headers: { 
            'Authorization': token,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );

      console.log('API response:', response.data);

      // Refresh notifications to ensure consistency
      await fetchNotifications();
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      setNotifications(prev => {
        const reverted = prev.map(n =>
          n._id === notificationId ? { ...n, read: false } : n
        );
        console.log('Reverted notifications:', reverted);
        return reverted;
      });
      setUnreadCount(prev => prev + 1);
      return false;
    }
  };

  const markAllAsRead = async () => {
    let previousUnreadCount = unreadCount;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Optimistically update the UI
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      // Make the API call
      await axios.patch(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { 
          headers: { 
            'Authorization': token,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );

      // Refresh notifications to ensure consistency
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: false }))
      );
      setUnreadCount(previousUnreadCount);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 