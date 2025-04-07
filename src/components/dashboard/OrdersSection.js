import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileDownload, faSearch } from '@fortawesome/free-solid-svg-icons';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch orders from Firebase
    // For now, we'll use mock data
    const fetchOrders = () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockOrders = [
          {
            id: 'ORDER-123456',
            date: '2025-04-01',
            total: 249.99,
            status: 'Completed',
            items: [
              { id: 1, name: 'Bounce House', quantity: 1, price: 199.99 },
              { id: 2, name: 'Cotton Candy Machine', quantity: 1, price: 50.00 }
            ]
          },
          {
            id: 'ORDER-123457',
            date: '2025-03-15',
            total: 349.99,
            status: 'Completed',
            items: [
              { id: 3, name: 'Water Slide', quantity: 1, price: 299.99 },
              { id: 4, name: 'Popcorn Machine', quantity: 1, price: 50.00 }
            ]
          },
          {
            id: 'ORDER-123458',
            date: '2025-02-28',
            total: 149.99,
            status: 'Cancelled',
            items: [
              { id: 5, name: 'Bubble Machine', quantity: 1, price: 49.99 },
              { id: 6, name: 'Party Tent', quantity: 1, price: 100.00 }
            ]
          }
        ];
        
        setOrders(mockOrders);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchOrders();
  }, []);
  
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
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
        <div className="loading">Loading your orders...</div>
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
                <div className="order-cell">{order.id}</div>
                <div className="order-cell">{formatDate(order.date)}</div>
                <div className="order-cell">${order.total.toFixed(2)}</div>
                <div className="order-cell">
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-cell actions">
                  <button className="action-button view">
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button className="action-button download">
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
