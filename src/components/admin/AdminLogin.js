import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faSpinner, 
  faKey, 
  faEnvelope,
  faExclamationTriangle,
  faG
} from '@fortawesome/free-solid-svg-icons';
import { 
  getCurrentUser, 
  resetPassword 
} from '../../services/authService';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleSignIn } = useAuth();
  
  // Check if user is already logged in and handle redirect result
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for redirect result first
        const result = await getRedirectResult(auth);
        if (result) {
          // User just signed in with Google redirect
          await handleGoogleSignInResult(result);
        }
        
        // Then check if user is already authenticated
        const user = await getCurrentUser();
        if (user && user.isStaff) {
          // Redirect to the intended page or dashboard
          const from = location.state?.from?.pathname || '/admin';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError(error.message || 'Authentication error. Please try again.');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, location]);
  
  // Handle Google sign-in result
  const handleGoogleSignInResult = async (result) => {
    try {
      setLoading(true);
      
      // If there's no result, return early
      if (!result || !result.user) {
        console.log('No Google sign-in result found');
        setLoading(false);
        return;
      }
      
      console.log('Google sign-in result:', result.user.email);
      
      // Use the googleSignIn function from AuthContext
      try {
        const staffUser = await googleSignIn(result.user);
        
        if (!staffUser) {
          console.error('Not a staff member:', result.user.email);
          setError('This Google account does not have admin access. Please use an authorized account or log in with email/password.');
          // Sign out since this is not a staff account
          await auth.signOut();
          return;
        }
        
        console.log('Successfully authenticated as staff:', result.user.email);
        
        // Navigate to admin dashboard
        navigate('/admin', { replace: true });
      } catch (error) {
        console.error('Error in Google sign-in:', error);
        setError(error.message || 'Authentication failed. Please try again.');
        await auth.signOut();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (resetMode) {
      handlePasswordReset();
      return;
    }
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const user = await login(email, password);
      
      // Debug user object
      console.log('User after login:', user);
      console.log('isStaff property:', user.isStaff);
      console.log('User permissions:', user.permissions);
      
      // Check if user is staff
      if (!user.isStaff) {
        setError('You do not have permission to access the admin area');
        setLoading(false);
        return;
      }
      
      // Always go to the admin dashboard after login
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      // Set appropriate error message
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(error.message || 'Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting Google sign-in process');
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      
      // Use popup method instead of redirect for better debugging
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in popup completed');
      
      // Handle the result directly instead of waiting for redirect
      await handleGoogleSignInResult(result);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to start Google sign-in. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else {
        setError(error.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between login and password reset
  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setError(null);
    setResetSent(false);
  };
  
  if (checkingAuth) {
    return (
      <div className="admin-login-container">
        <div className="loading-indicator">
          <FontAwesomeIcon icon={faSpinner} spin /> Checking authentication...
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Rowe Bros Admin</h1>
          <h2>{resetMode ? 'Reset Password' : 'Login'}</h2>
        </div>
        
        {error && (
          <div className="admin-login-error">
            <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
          </div>
        )}
        
        {resetSent && (
          <div className="admin-login-success">
            Password reset email sent! Check your inbox for instructions.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          {!resetMode && (
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faKey} /> Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="admin-login-button" 
            disabled={loading}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : resetMode ? (
              'Send Reset Link'
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} /> Login
              </>
            )}
          </button>
        </form>
        
        {!resetMode && (
          <>
            <div className="admin-login-separator">
              <span>OR</span>
            </div>
            
            <div className="social-login">
              <button 
                className="google-login-button"
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
              >
                <FontAwesomeIcon icon={faG} className="social-icon" />
                Continue with Google
              </button>
            </div>
          </>
        )}
        
        <div className="admin-login-footer">
          <button 
            type="button" 
            className="text-button" 
            onClick={toggleResetMode}
            disabled={loading}
          >
            {resetMode ? 'Back to Login' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
