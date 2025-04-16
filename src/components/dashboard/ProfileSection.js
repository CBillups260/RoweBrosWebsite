import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const ProfileSection = ({ user }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setProfileData(prevData => ({
            ...prevData,
            displayName: user?.displayName || data.displayName || '',
            email: user?.email || data.email || '',
            phone: data.phone || ''
          }));
        } else {
          // Create user document if it doesn't exist
          const newUserData = {
            displayName: user?.displayName || '',
            email: user?.email || '',
            phone: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [currentUser, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
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

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.displayName) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation (optional field)
    if (profileData.phone && !/^\d{10}$/.test(profileData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!profileData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!profileData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (profileData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!profileData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (profileData.newPassword !== profileData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Update Firebase Auth profile
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }
      
      // Update email if changed
      if (profileData.email !== user.email) {
        await updateEmail(auth.currentUser, profileData.email);
      }
      
      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        displayName: profileData.displayName,
        email: profileData.email,
        phone: profileData.phone || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please log out and log back in before changing your email.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account.';
      }
      
      setErrors({
        form: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        profileData.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, profileData.newPassword);
      
      // Update Firestore to record password change (don't store the password!)
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        passwordLastChanged: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSuccessMessage('Password updated successfully!');
      setShowPasswordUpdate(false);
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
        setErrors({
          currentPassword: errorMessage
        });
      } else {
        setErrors({
          form: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data to current values
    setProfileData({
      ...profileData,
      displayName: user.displayName || '',
      email: user.email || '',
      phone: userData?.phone || ''
    });
  };

  const cancelPasswordUpdate = () => {
    setShowPasswordUpdate(false);
    setErrors({});
    setProfileData({
      ...profileData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="dashboard-section profile-section">
      <div className="section-header">
        <h2>My Profile</h2>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errors.form && (
        <div className="error-message">
          {errors.form}
        </div>
      )}
      
      {!showPasswordUpdate ? (
        <div className="profile-content">
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Name</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.displayName && <div className="input-error">{errors.displayName}</div>}
                </>
              ) : (
                <div className="profile-info">{user.displayName || 'Not set'}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Email</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && <div className="input-error">{errors.email}</div>}
                </>
              ) : (
                <div className="profile-info">{user.email}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                    disabled={isLoading}
                  />
                  {errors.phone && <div className="input-error">{errors.phone}</div>}
                </>
              ) : (
                <div className="profile-info">{userData?.phone || 'Not set'}</div>
              )}
            </div>
            
            {isEditing && (
              <div className="button-group">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Save Changes
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={cancelEdit}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            )}
          </form>
          
          <div className="password-section">
            <h3>Password</h3>
            {!isEditing && (
              <button 
                className="change-password-button"
                onClick={() => setShowPasswordUpdate(true)}
              >
                Change Password
              </button>
            )}
          </div>
          
          <div className="account-info">
            <h3>Account Information</h3>
            <div className="info-item">
              <span className="info-label">Account Created:</span>
              <span className="info-value">
                {userData?.createdAt ? 
                  (userData.createdAt.toDate ? 
                    new Date(userData.createdAt.toDate()).toLocaleDateString() : 
                    new Date(userData.createdAt).toLocaleDateString()) : 
                  user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Sign In:</span>
              <span className="info-value">
                {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            {userData?.passwordLastChanged && (
              <div className="info-item">
                <span className="info-label">Password Last Changed:</span>
                <span className="info-value">
                  {userData.passwordLastChanged.toDate ? 
                    new Date(userData.passwordLastChanged.toDate()).toLocaleDateString() : 
                    new Date(userData.passwordLastChanged).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="password-update-content">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.currentPassword && <div className="input-error">{errors.currentPassword}</div>}
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={profileData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.newPassword && <div className="input-error">{errors.newPassword}</div>}
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.confirmPassword && <div className="input-error">{errors.confirmPassword}</div>}
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={cancelPasswordUpdate}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
