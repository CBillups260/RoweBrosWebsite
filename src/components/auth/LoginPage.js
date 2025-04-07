import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faEye, faEyeSlash, faG } from '@fortawesome/free-solid-svg-icons';
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check if there's a redirect path in the URL
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (activeTab === 'login') {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (activeTab === 'login') {
        // Sign in with our auth service
        await login(formData.email, formData.password);
        console.log('User logged in successfully');
      } else {
        // Sign up with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update the user's display name in Firebase
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        
        console.log('User account created successfully');
      }
      
      // Redirect to the intended destination
      navigate(redirectTo);
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Provide more specific error messages
      switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already in use. Please try another email or login.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email format is invalid.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = `Authentication failed: ${error.message}`;
      }
      
      setErrors({
        form: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      
      // Add scopes for Google account information
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      
      // Set custom parameters for the auth provider
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful', result.user);
      
      // Create a user object from the Google sign-in result
      const user = result.user;
      
      // Store user info in localStorage to handle the redirect
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
      localStorage.setItem('userPhoto', user.photoURL || '');
      localStorage.setItem('isLoggedIn', 'true');
      
      // Redirect to the intended destination
      navigate('/dashboard');
    } catch (error) {
      console.error('Google authentication error:', error);
      let errorMessage = 'Google login failed. Please try another method.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'You closed the Google login popup. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'The login popup was blocked. Please enable popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Multiple popup requests were triggered. Please try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for OAuth operations. Contact the administrator.';
      }
      
      setErrors({
        form: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        
        <div className="auth-content">
          <h1>{activeTab === 'login' ? 'Welcome Back!' : 'Create an Account'}</h1>
          <p className="auth-subtitle">
            {activeTab === 'login' 
              ? 'Login to access your account and manage your rentals.' 
              : 'Sign up to save your favorite rentals and get special offers.'}
          </p>
          
          {errors.form && <div className="auth-error">{errors.form}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'signup' && (
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
                {errors.name && <div className="input-error">{errors.name}</div>}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              {errors.email && <div className="input-error">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && <div className="input-error">{errors.password}</div>}
            </div>
            
            {activeTab === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FontAwesomeIcon icon={faLock} /> Confirm Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
              </div>
            )}
            
            {activeTab === 'login' && (
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            )}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-separator">
            <span>OR</span>
          </div>
          
          <div className="social-login">
            <button 
              className="social-button google"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
            >
              <FontAwesomeIcon icon={faG} className="social-icon" />
              Continue with Google
            </button>
          </div>
          
          <div className="auth-footer">
            {activeTab === 'login' ? (
              <p>Don't have an account? <button type="button" onClick={() => setActiveTab('signup')}>Sign Up</button></p>
            ) : (
              <p>Already have an account? <button type="button" onClick={() => setActiveTab('login')}>Login</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
