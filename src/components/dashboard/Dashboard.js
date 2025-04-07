import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShoppingBag, 
  faCreditCard, 
  faHeart, 
  faAddressBook,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import ProfileSection from './ProfileSection';
import OrdersSection from './OrdersSection';
import PaymentMethodsSection from './PaymentMethodsSection';
import FavoritesSection from './FavoritesSection';
import AddressesSection from './AddressesSection';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [localUser, setLocalUser] = useState(null);
  
  useEffect(() => {
    // Check for user info in localStorage (for Google sign-in)
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true' && !currentUser) {
      setLocalUser({
        displayName: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        photoURL: localStorage.getItem('userPhoto'),
        isCustomer: true
      });
    } else if (currentUser) {
      setLocalUser(null); // Use AuthContext user instead
    }
  }, [currentUser]);
  
  // Use either the authenticated user from context or the local storage user
  const user = currentUser || localUser;
  
  // Redirect to login if not authenticated and no local user
  if (!user && !isAuthenticated) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }
  
  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhoto');
      localStorage.removeItem('isLoggedIn');
      
      // Logout from Firebase if using AuthContext
      if (logout) {
        await logout();
      }
      
      // Force reload to clear any state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Render the active section based on the selected tab
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection user={user} />;
      case 'orders':
        return <OrdersSection />;
      case 'payment-methods':
        return <PaymentMethodsSection />;
      case 'favorites':
        return <FavoritesSection />;
      case 'addresses':
        return <AddressesSection />;
      default:
        return <ProfileSection user={user} />;
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Account</h1>
        <p>Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Customer'}</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="user-info">
            <div className="user-details">
              <h3>{user?.displayName || user?.email?.split('@')[0] || 'Customer'}</h3>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <ul>
              <li 
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => setActiveTab('profile')}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
              </li>
              <li 
                className={activeTab === 'orders' ? 'active' : ''}
                onClick={() => setActiveTab('orders')}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                <span>Orders</span>
              </li>
              <li 
                className={activeTab === 'payment-methods' ? 'active' : ''}
                onClick={() => setActiveTab('payment-methods')}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Payment Methods</span>
              </li>
              <li 
                className={activeTab === 'favorites' ? 'active' : ''}
                onClick={() => setActiveTab('favorites')}
              >
                <FontAwesomeIcon icon={faHeart} />
                <span>Favorites</span>
              </li>
              <li 
                className={activeTab === 'addresses' ? 'active' : ''}
                onClick={() => setActiveTab('addresses')}
              >
                <FontAwesomeIcon icon={faAddressBook} />
                <span>Addresses</span>
              </li>
              <li className="logout-item" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="dashboard-main">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
