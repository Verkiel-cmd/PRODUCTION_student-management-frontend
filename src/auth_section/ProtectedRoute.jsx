import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('https://student-management-backend-a2q4.onrender.com/auth/validate', {
          withCredentials: true
        });
        setIsAuthenticated(res.data.authenticated);
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!authChecked) return null; // or loader/spinner

  if (!isAuthenticated) {
    return <Navigate to="/auth_section/Frontlog" replace />;
  }

  return children;
};

export default ProtectedRoute;
