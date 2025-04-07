import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import '../../styles/auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox for further instructions.');
      setEmail(''); // Clear the email field after success
    } catch (error) {
      console.error('Password reset error:', error);
      
      switch(error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        default:
          setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <h1>Reset Your Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
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
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="auth-footer">
            <Link to="/login" className="back-to-login">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
