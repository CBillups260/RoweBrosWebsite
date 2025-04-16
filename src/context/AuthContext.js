import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signIn,
  logOut,
  getCurrentUser,
  hasPermission,
  isAdmin,
  isManagerOrAdmin,
  handleGoogleSignIn
} from '../services/authService';

// Create the Authentication Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap the app and provide auth context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to log in
  const login = async (email, password) => {
    const user = await signIn(email, password);
    setCurrentUser(user);
    return user;
  };

  // Function to handle Google sign-in
  const googleSignIn = async (user) => {
    const staffUser = await handleGoogleSignIn(user);
    if (staffUser) {
      setCurrentUser(staffUser);
    }
    return staffUser;
  };

  // Function to log out
  const logout = async () => {
    await logOut();
    setCurrentUser(null);
  };

  // Check if user has permission
  const checkPermission = (permission) => {
    return hasPermission(currentUser, permission);
  };

  // Check if user is admin
  const checkIsAdmin = () => {
    return isAdmin(currentUser);
  };

  // Check if user is manager or admin
  const checkIsManagerOrAdmin = () => {
    return isManagerOrAdmin(currentUser);
  };

  // Set up auth state on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Context value to be provided
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    googleSignIn,
    logout,
    loading,
    hasPermission: checkPermission,
    isAdmin: checkIsAdmin,
    isManagerOrAdmin: checkIsManagerOrAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
