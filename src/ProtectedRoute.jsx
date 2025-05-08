import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');
  let isAuthenticated = false;

  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      isAuthenticated = !!user;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clean up invalid data
  }

  if (!isAuthenticated) {
    return <Navigate to="/Frontlog" replace />;
  }

  return children;
};

export default ProtectedRoute;