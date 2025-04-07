import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort,
  faEye,
  faEdit,
  faFileInvoice,
  faCalendarAlt,
  faUser,
  faTruck,
  faTag,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { 
  getOrders, 
  getOrdersPaginated, 
  updateOrderStatus,
  searchOrders
} from '../../services/orderService';
import OrderDetails from './OrderDetails';

const OrdersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  
  const ordersPerPage = 10;
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Fetch orders from Firebase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getOrdersPaginated(null, ordersPerPage);
      setOrders(result.orders);
      setFilteredOrders(result.orders);
      setLastVisible(result.lastVisible);
      
      // Estimate total pages (this is a simple approach)
      // In a real app, you might want to get a count of all orders
      setTotalPages(Math.ceil(result.orders.length / ordersPerPage));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load more orders (pagination)
  const loadMoreOrders = async () => {
    if (!lastVisible || currentPage >= totalPages) return;
    
    try {
      setLoading(true);
      const result = await getOrdersPaginated(lastVisible, ordersPerPage);
      
      if (result.orders.length > 0) {
        setOrders([...orders, ...result.orders]);
        setLastVisible(result.lastVisible);
        setCurrentPage(currentPage + 1);
      }
      
      // Update estimated total pages
      const estimatedTotal = orders.length + result.orders.length;
      setTotalPages(Math.ceil(estimatedTotal / ordersPerPage));
      
    } catch (err) {
      console.error('Error loading more orders:', err);
      alert('Failed to load more orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'total-asc':
          return a.total - b.total;
        case 'total-desc':
          return b.total - a.total;
        default:
          return 0;
      }
    });
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm, sortBy]);
  
  // Handle search with debounce
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
    switch (status?.toLowerCase()) {
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
  
  // Handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  // Handle updating order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      
      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };
  
  // Handle status update menu
  const handleStatusMenu = (e, orderId, currentStatus) => {
    e.stopPropagation();
    
    const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    const currentIndex = statusOptions.findIndex(status => 
      status.toLowerCase() === currentStatus.toLowerCase()
    );
    
    // Create a dropdown menu
    const menu = document.createElement('div');
    menu.className = 'status-dropdown';
    
    statusOptions.forEach(status => {
      const option = document.createElement('div');
      option.className = `status-option ${status.toLowerCase() === currentStatus.toLowerCase() ? 'active' : ''}`;
      option.innerText = status;
      option.onclick = () => {
        if (status.toLowerCase() !== currentStatus.toLowerCase()) {
          handleUpdateStatus(orderId, status);
        }
        document.body.removeChild(menu);
      };
      menu.appendChild(option);
    });
    
    // Position and show the menu
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.zIndex = 1000;
    
    // Add click outside handler
    const handleClickOutside = (event) => {
      if (!menu.contains(event.target) && event.target !== button) {
        document.body.removeChild(menu);
        document.removeEventListener('click', handleClickOutside);
      }
    };
    
    document.body.appendChild(menu);
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  };
  
  // Handle generating invoice
  const handleGenerateInvoice = (order) => {
    // In a real app, this would generate a PDF invoice
    alert(`Invoice for order ${order.id} would be generated here.`);
  };
  
  // Handle closing order details
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };
  
  if (loading && orders.length === 0) {
    return (
      <div className="dashboard-section orders-section">
        <div className="loading-indicator">Loading orders...</div>
      </div>
    );
  }
  
  if (error && orders.length === 0) {
    return (
      <div className="dashboard-section orders-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section orders-section">
      {showOrderDetails && selectedOrder ? (
        <OrderDetails 
          order={selectedOrder} 
          onClose={handleCloseOrderDetails}
          onStatusUpdate={(newStatus) => handleUpdateStatus(selectedOrder.id, newStatus)}
        />
      ) : (
        <>
          <div className="section-header">
            <h2>Orders Management</h2>
          </div>
          
          <div className="filters-bar">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="filter-box">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value.toLowerCase())}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="sort-box">
              <FontAwesomeIcon icon={faSort} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="total-desc">Total (High to Low)</option>
                <option value="total-asc">Total (Low to High)</option>
              </select>
            </div>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">
                            <FontAwesomeIcon icon={faUser} /> {order.customer?.name || 'Unknown'}
                          </div>
                          <div className="customer-email">{order.customer?.email || 'No email'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="order-date">
                          <FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="order-items">
                          <FontAwesomeIcon icon={faTag} /> {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                      <td>{formatCurrency(order.total || 0)}</td>
                      <td>
                        <span className={`order-status ${getStatusClass(order.status)}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="icon-button view" 
                          title="View Order Details"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="icon-button edit" 
                          title="Update Order Status"
                          onClick={(e) => handleStatusMenu(e, order.id, order.status)}
                          disabled={isUpdatingStatus === order.id}
                        >
                          {isUpdatingStatus === order.id ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            <FontAwesomeIcon icon={faTruck} />
                          )}
                        </button>
                        <button 
                          className="icon-button invoice" 
                          title="Generate Invoice"
                          onClick={() => handleGenerateInvoice(order)}
                        >
                          <FontAwesomeIcon icon={faFileInvoice} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-table-message">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {loading && orders.length > 0 && (
            <div className="loading-more">
              <FontAwesomeIcon icon={faSpinner} spin /> Loading more orders...
            </div>
          )}
          
          {filteredOrders.length === 0 && orders.length > 0 && (
            <div className="empty-state">
              <p>No orders found matching your search criteria.</p>
            </div>
          )}
          
          {orders.length === 0 && !loading && (
            <div className="empty-state">
              <p>No orders have been placed yet.</p>
            </div>
          )}
          
          {orders.length > 0 && currentPage < totalPages && (
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={loadMoreOrders}
                disabled={loading || currentPage >= totalPages}
              >
                Load More Orders
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersSection;
