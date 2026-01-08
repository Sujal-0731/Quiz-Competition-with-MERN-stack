import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAuth } from '../services/authServices';

const ProtectedRoute = ({ children, allowedRole }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null,
    loading: true
  });

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('ProtectedRoute: Checking authentication...');
        const response = await checkAuth();
        console.log('ProtectedRoute: Auth response:', response);
        
        if (response.success && response.user) {
          console.log('ProtectedRoute: User authenticated, role:', response.user.role);
          setAuthState({
            isAuthenticated: true,
            userRole: response.user.role,
            loading: false
          });
        } else {
          console.log('ProtectedRoute: Not authenticated');
          setAuthState({
            isAuthenticated: false,
            userRole: null,
            loading: false
          });
        }
      } catch (error) {
        console.error('ProtectedRoute: Auth check failed:', error);
        console.error('ProtectedRoute: Error details:', error.response?.data);
        setAuthState({
          isAuthenticated: false,
          userRole: null,
          loading: false
        });
      }
    };

    verifyAuth();
  }, []);

  console.log('ProtectedRoute: Current state:', authState);
  console.log('ProtectedRoute: Allowed role:', allowedRole);

  if (authState.loading) {
    console.log('ProtectedRoute: Loading...');
    return <div className="loading">Checking authentication...</div>;
  }

  if (!authState.isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRole && authState.userRole !== allowedRole) {
    console.log(`ProtectedRoute: Role mismatch. User: ${authState.userRole}, Required: ${allowedRole}`);
    return <Navigate to="/unauthorized" />;
  }

  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;