import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { currentUser, hasPermission, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Once auth context has loaded, update our local loading state
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-indicator">
          <FontAwesomeIcon icon={faSpinner} spin /> Verifying access...
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // If user is not staff, deny access to admin routes
  if (!currentUser.isStaff) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
        <p><a href="/">Return to Home</a></p>
      </div>
    );
  }
  
  // If permission is required, check if user has it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  // If authenticated and has permission, render the protected component
  return children;
};

export default ProtectedRoute;
