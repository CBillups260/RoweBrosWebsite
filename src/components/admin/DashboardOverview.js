import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faShoppingBag, 
  faUsers, 
  faChartLine,
  faCalendarAlt,
  faExclamationTriangle,
  faListUl,
  faSpinner,
  faPlus,
  faUserPlus,
  faLayerGroup,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { getStaffMembers } from '../../services/staffService';
import { getSalesSummary, getRecentOrders } from '../../services/salesService';
import { getCategories } from '../../services/categoryService';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalStaff: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalCategories: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const products = await getProducts();
      
      // Fetch staff
      const staff = await getStaffMembers();
      
      // Fetch categories
      const categories = await getCategories();
      
      // Fetch sales summary
      const salesSummary = await getSalesSummary();
      
      // Fetch recent orders
      const orders = await getRecentOrders(5);
      setRecentOrders(orders);
      
      // Calculate low stock items (products with quantity < 5)
      const lowStockCount = products.filter(product => 
        (product.quantity || 0) < 5
      ).length;
      
      // Calculate pending orders
      const pendingCount = orders.filter(order => 
        order.status?.toLowerCase() === 'pending' || 
        order.status?.toLowerCase() === 'processing'
      ).length;
      
      // Update stats
      setStats({
        totalProducts: products.length,
        totalOrders: salesSummary.totalOrders || 0,
        totalStaff: staff.length,
        totalRevenue: salesSummary.totalRevenue || 0,
        pendingOrders: pendingCount,
        lowStockItems: lowStockCount,
        totalCategories: categories.length
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-section overview-section">
        <div className="loading-indicator">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading dashboard data...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-section overview-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section overview-section">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders">
            <FontAwesomeIcon icon={faShoppingBag} />
          </div>
          <div className="stat-details">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon customers">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-details">
            <h3>Total Staff</h3>
            <p className="stat-value">{stats.totalStaff}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-details">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faCalendarAlt} /> Recent Orders
            </h3>
          </div>
          <div className="card-content">
            {recentOrders.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{order.customerName || 'Guest'}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatCurrency(order.totalAmount || 0)}</td>
                      <td>
                        <span className={`order-status ${getStatusClass(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="view-link">
                          <FontAwesomeIcon icon={faEye} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="action-buttons">
              <Link to="/admin/products/new" className="action-button">
                <FontAwesomeIcon icon={faPlus} /> Add New Product
              </Link>
              <Link to="/admin/staff/new" className="action-button">
                <FontAwesomeIcon icon={faUserPlus} /> Add Staff Member
              </Link>
              <Link to="/admin/categories" className="action-button">
                <FontAwesomeIcon icon={faLayerGroup} /> Manage Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-card alerts">
          <div className="card-header">
            <h3>
              <FontAwesomeIcon icon={faExclamationTriangle} /> Alerts
            </h3>
          </div>
          <div className="card-content">
            {stats.pendingOrders > 0 && (
              <div className="alert-item">
                <div className="alert-icon pending">
                  <FontAwesomeIcon icon={faShoppingBag} />
                </div>
                <div className="alert-details">
                  <h4>{stats.pendingOrders} Pending Orders</h4>
                  <p>Orders waiting to be processed</p>
                </div>
                <Link to="/admin/orders?status=pending" className="alert-action">View</Link>
              </div>
            )}
            
            {stats.lowStockItems > 0 && (
              <div className="alert-item">
                <div className="alert-icon warning">
                  <FontAwesomeIcon icon={faBox} />
                </div>
                <div className="alert-details">
                  <h4>{stats.lowStockItems} Low Stock Items</h4>
                  <p>Products that need to be restocked</p>
                </div>
                <Link to="/admin/products?stock=low" className="alert-action">View</Link>
              </div>
            )}
            
            {stats.pendingOrders === 0 && stats.lowStockItems === 0 && (
              <div className="empty-state">
                <p>No alerts at this time. Everything is running smoothly!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
