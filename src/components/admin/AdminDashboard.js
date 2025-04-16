import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faListUl, 
  faUsers, 
  faChartLine, 
  faShoppingBag,
  faSignOutAlt,
  faTachometerAlt,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import ProductsSection from './ProductsSection';
import CategoriesSection from './CategoriesSection';
import StaffSection from '../dashboard/StaffSection';
import SalesSection from './SalesSection';
import OrdersSection from './OrdersSection';
import DashboardOverview from './DashboardOverview';
import { ensureDefaultRolesExist } from '../../services/roleService';
import '../../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [rolesInitialized, setRolesInitialized] = useState(false);
  
  // Initialize default roles when the dashboard loads
  useEffect(() => {
    const initRoles = async () => {
      try {
        // Skip role initialization in development environment to avoid permission errors
        if (process.env.NODE_ENV === 'development') {
          console.log('Skipping role initialization in development environment');
          setRolesInitialized(true);
          return;
        }
        
        const result = await ensureDefaultRolesExist();
        setRolesInitialized(true);
        console.log('Roles initialization:', result ? 'Created default roles' : 'Roles already exist');
      } catch (error) {
        console.error('Error initializing roles:', error);
        setRolesInitialized(true); // Set to true even on error to allow UI to render
      }
    };
    
    initRoles();
  }, []);
  
  // Set active tab from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'products', 'categories', 'staff', 'sales', 'orders', 'roles'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);
  
  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Render the active section based on the selected tab
  const renderActiveSection = () => {
    if (!rolesInitialized) {
      return <div className="loading">Initializing system...</div>;
    }
    
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'products':
        return <ProductsSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'staff':
        return <StaffSection />;
      case 'sales':
        return <SalesSection />;
      case 'orders':
        return <OrdersSection />;
      default:
        return <DashboardOverview />;
    }
  };
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info-header">
          <span>Welcome, {currentUser?.displayName || 'User'}</span>
          <button className="logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>
      
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-sidebar">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            <div className="admin-user-details">
              <h3>{currentUser?.displayName || 'User'}</h3>
              <p>{currentUser?.email || ''}</p>
              <span className="admin-badge">{currentUser?.roleName || currentUser?.role || 'Staff'}</span>
            </div>
          </div>
          
          <nav className="admin-dashboard-nav">
            <ul>
              <li 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                <FontAwesomeIcon icon={faTachometerAlt} />
                <span>Overview</span>
              </li>
              
              <li 
                className={activeTab === 'products' ? 'active' : ''}
                onClick={() => setActiveTab('products')}
              >
                <FontAwesomeIcon icon={faBox} />
                <span>Products</span>
              </li>
              
              <li 
                className={activeTab === 'categories' ? 'active' : ''}
                onClick={() => setActiveTab('categories')}
              >
                <FontAwesomeIcon icon={faListUl} />
                <span>Categories</span>
              </li>
              
              <li 
                className={activeTab === 'staff' ? 'active' : ''}
                onClick={() => setActiveTab('staff')}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Staff</span>
              </li>
              
              <li 
                className={activeTab === 'sales' ? 'active' : ''}
                onClick={() => setActiveTab('sales')}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Sales</span>
              </li>
              
              <li 
                className={activeTab === 'orders' ? 'active' : ''}
                onClick={() => setActiveTab('orders')}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                <span>Orders</span>
              </li>
              
              <li className="logout-item" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="admin-dashboard-main">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
