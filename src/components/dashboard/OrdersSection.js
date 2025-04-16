import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileDownload, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      console.log('Current user:', currentUser);
      console.log('Fetching orders for user ID:', currentUser.uid);
      console.log('User email:', currentUser.email);
      
      try {
        // Get all orders and filter client-side for debugging
        const ordersRef = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersRef);
        
        console.log('Total orders in database:', ordersSnapshot.size);
        
        if (ordersSnapshot.empty) {
          console.log('No orders found in the database');
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        // Transform all orders for inspection
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.createdAt?.toDate?.() || new Date(),
            total: data.total || 0,
            subtotal: data.subtotal || 0,
            status: data.status || 'Processing',
            items: data.items || [],
            payment: data.payment || {},
            delivery: data.delivery || {},
            customer: data.customer || {},
            customerId: data.customerId,
            customerUid: data.customerUid,
            userId: data.userId,
            uid: data.uid
          };
        });
        
        console.log('All orders:', allOrders);
        
        // Filter orders that match this user by any possible ID field
        const userOrders = allOrders.filter(order => {
          const possibleMatches = [
            order.customerId === currentUser.uid,
            order.customerUid === currentUser.uid,
            order.userId === currentUser.uid,
            order.uid === currentUser.uid,
            order.customer?.customerId === currentUser.uid,
            order.customer?.uid === currentUser.uid,
            order.customer?.email === currentUser.email
          ];
          
          console.log(`Order ${order.id} match status:`, possibleMatches);
          
          return possibleMatches.some(match => match === true);
        });
        
        console.log('Filtered orders for current user:', userOrders);
        
        // Sort by date (newest first)
        userOrders.sort((a, b) => b.date - a.date);
        
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [currentUser]);
  
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => 
      item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'shipped':
      case 'delivered':
        return 'status-shipped';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };
  
  const handleViewOrder = (orderId) => {
    // In a real app, navigate to order details page
    console.log('View order:', orderId);
    // You could implement a modal or navigation to a details page
  };
  
  const handleDownloadReceipt = (order) => {
    // In a real app, generate and download a receipt
    console.log('Download receipt for order:', order.id);
    // You could implement PDF generation here
  };
  
  return (
    <div className="dashboard-section orders-section">
      <div className="section-header">
        <h2>My Orders</h2>
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading your orders...
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-list">
          <div className="orders-table">
            <div className="orders-header">
              <div className="order-cell">Order ID</div>
              <div className="order-cell">Date</div>
              <div className="order-cell">Total</div>
              <div className="order-cell">Status</div>
              <div className="order-cell">Actions</div>
            </div>
            
            {filteredOrders.map(order => (
              <div key={order.id} className="order-row">
                <div className="order-cell">{order.id.substring(0, 8).toUpperCase()}</div>
                <div className="order-cell">{formatDate(order.date)}</div>
                <div className="order-cell">${order.total.toFixed(2)}</div>
                <div className="order-cell">
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-cell actions">
                  <button 
                    className="action-button view"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button 
                    className="action-button download"
                    onClick={() => handleDownloadReceipt(order)}
                  >
                    <FontAwesomeIcon icon={faFileDownload} /> Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>No orders found{searchTerm ? ' matching your search' : ''}.</p>
          {searchTerm ? (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          ) : (
            <Link to="/rentals" className="browse-link">Browse Rentals</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
