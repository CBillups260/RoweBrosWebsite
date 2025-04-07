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
  signIn, 
  getCurrentUser, 
  resetPassword 
} from '../../services/authService';
import { 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

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
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.isStaff) {
          // Redirect to the intended page or dashboard
          const from = location.state?.from?.pathname || '/admin';
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, location]);
  
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
      
      const user = await signIn(email, password);
      
      // Check if user is staff
      if (!user.isStaff) {
        setError('You do not have permission to access the admin area');
        setLoading(false);
        return;
      }
      
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
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
      
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      const result = await signInWithPopup(auth, provider);
      
      // Check if the Google user is a staff member in Firestore
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, where("email", "==", result.user.email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Not a staff member
        setError('This Google account does not have admin access. Please use an authorized account or log in with email/password.');
        setLoading(false);
        // Sign out since this is not a staff account
        await auth.signOut();
        return;
      }
      
      const staffData = snapshot.docs[0].data();
      
      // Check if staff is active
      if (staffData.status !== 'Active') {
        setError('Your account is not active. Please contact an administrator.');
        setLoading(false);
        // Sign out since this is not an active account
        await auth.signOut();
        return;
      }
      
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google login error:', error);
      
      // Set appropriate error message
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up blocked by browser. Please allow pop-ups for this site.');
      } else {
        setError(error.message || 'Failed to log in with Google. Please try again.');
      }
      
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
