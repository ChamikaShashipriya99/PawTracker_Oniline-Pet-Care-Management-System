import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking authentication...');
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('User from localStorage:', user);
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token');
      
      if (user && token) {
        try {
          const parsedUser = JSON.parse(user);
          console.log('Parsed user:', parsedUser);
          const isAuth = !!(parsedUser && token);
          console.log('Is authenticated:', isAuth);
          setIsAuthenticated(isAuth);
        } catch (e) {
          console.error('Error parsing user data:', e);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No user or token found');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;