import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSortAmountDown, 
  faSortAmountUp, 
  faUser,
  faTruck,
  faTag,
  faSpinner,
  faEye,
  faPrint,
  faCalendarAlt,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  getOrders, 
  getOrdersPaginated, 
  updateOrderStatus,
  searchOrders
} from '../../services/orderService';
import OrderDetails from './OrderDetails';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Fetch orders from Firebase
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getOrdersPaginated(null, ordersPerPage);
      
      // Debug: Log the first order to see its structure
      if (result.orders.length > 0) {
        console.log('First order structure:', JSON.stringify(result.orders[0], null, 2));
      }
      
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
    
    // Apply date filter
    if (startDate && endDate) {
      result = result.filter(order => 
        new Date(order.createdAt) >= new Date(startDate) && new Date(order.createdAt) <= new Date(endDate)
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
  }, [orders, statusFilter, searchTerm, sortBy, startDate, endDate]);
  
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
  
  // Function to handle printing filtered orders
  const handlePrintOrders = () => {
    // Get orders to print - either selected orders or all filtered orders
    const ordersToPrint = getSelectedOrdersCount() > 0 
      ? getSelectedOrdersArray() 
      : filteredOrders;
    
    // If no orders to print, show alert
    if (ordersToPrint.length === 0) {
      alert('No orders selected for printing.');
      return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get current date for the report header
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create the print content with styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rowe Bros - Delivery Orders</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            color: #333;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .filter-info {
            margin-bottom: 20px;
            font-style: italic;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .order-status {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.85em;
            display: inline-block;
          }
          .status-pending {
            background-color: #ffeeba;
            color: #856404;
          }
          .status-processing {
            background-color: #b8daff;
            color: #004085;
          }
          .status-completed {
            background-color: #c3e6cb;
            color: #155724;
          }
          .status-cancelled {
            background-color: #f5c6cb;
            color: #721c24;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
          }
          .delivery-info {
            margin-top: 5px;
            font-size: 0.9em;
            color: #666;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rowe Bros Delivery Orders</h1>
          <p>${formattedDate}</p>
        </div>
        
        <div class="filter-info">
          ${getSelectedOrdersCount() > 0 
            ? `${getSelectedOrdersCount()} selected orders` 
            : startDate && endDate 
              ? `Orders from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}` 
              : 'All Orders'}
          ${statusFilter !== 'all' ? ` | Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Address</th>
              <th>Delivery Time</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToPrint.map(order => `
              <tr>
                <td>${order.id.substring(0, 8)}...</td>
                <td>
                  ${order.customerName || 
                    (order.customer?.name) || 
                    (order.customerInfo?.name) || 
                    (order.customerInfo?.firstName && order.customerInfo?.lastName ? 
                      `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
                      (order.customer?.firstName && order.customer?.lastName ? 
                        `${order.customer.firstName} ${order.customer.lastName}` : 
                        'Guest'))}
                  <div>${order.customer?.phone || order.customerInfo?.phone || ''}</div>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  ${order.delivery?.address || order.deliveryInfo?.address || 'N/A'}<br>
                  ${(order.delivery?.city || order.deliveryInfo?.city) ? 
                    `${order.delivery?.city || order.deliveryInfo?.city}, 
                     ${order.delivery?.state || order.deliveryInfo?.state} 
                     ${order.delivery?.zipCode || order.deliveryInfo?.zipCode}` : 'N/A'}
                </td>
                <td>
                  ${order.delivery?.date || order.deliveryInfo?.deliveryDate || 'N/A'}<br>
                  ${order.delivery?.time || order.deliveryInfo?.deliveryTime || 'N/A'}
                </td>
                <td>
                  ${order.items.map(item => `
                    ${item.quantity || 1} x ${item.name} ($${(item.price || 0).toFixed(2)})
                  `).join('<br>')}
                </td>
                <td>$${(order.total || order.totalAmount || 0).toFixed(2)}</td>
                <td>
                  <span class="order-status status-${(order.status || 'pending').toLowerCase().replace(' ', '-')}">
                    ${order.status || 'Pending'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Total Orders: ${ordersToPrint.length}</p>
          <p>Generated on ${formattedDate}</p>
          <button class="no-print" onclick="window.print()">Print This Report</button>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window and print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Automatically print after the content is loaded
    printWindow.onload = function() {
      // Give a moment for styles to apply
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  };
  
  // Get current page orders
  const getCurrentPageOrders = () => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  };
  
  // Handle order status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(prevFiltered => 
        prevFiltered.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };
  
  // Toggle order selection
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    // If turning off select mode, clear selections
    if (selectMode) {
      setSelectedOrders({});
    }
  };

  // Select/deselect all orders on current page
  const toggleSelectAll = () => {
    const currentPageOrders = getCurrentPageOrders();
    const allSelected = currentPageOrders.every(order => selectedOrders[order.id]);
    
    const newSelectedOrders = { ...selectedOrders };
    
    currentPageOrders.forEach(order => {
      newSelectedOrders[order.id] = !allSelected;
    });
    
    setSelectedOrders(newSelectedOrders);
  };

  // Get count of selected orders
  const getSelectedOrdersCount = () => {
    return Object.values(selectedOrders).filter(selected => selected).length;
  };
  
  // Get array of selected orders
  const getSelectedOrdersArray = () => {
    return filteredOrders.filter(order => selectedOrders[order.id]);
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
      <style>
        {`
          .filter-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            align-items: center;
          }
          
          .search-box, .filter-box, .sort-box, .date-filter-box {
            display: flex;
            align-items: center;
            background-color: #f5f5f5;
            border-radius: 4px;
            padding: 5px 10px;
          }
          
          .date-filter-box {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .date-filter-box input[type="date"] {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px 8px;
            font-size: 14px;
          }
          
          .date-filter-box .fa-calendar-alt {
            color: #666;
            margin-right: 5px;
          }
          
          .icon-button {
            background-color: #f5f5f5;
            color: #333;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          
          .icon-button:hover {
            background-color: #e0e0e0;
          }
          
          .icon-button.active {
            background-color: #4a90e2;
            color: white;
          }
          
          .icon-button.print {
            background-color: #28a745;
            color: white;
          }
          
          .icon-button.print:hover {
            background-color: #218838;
          }
          
          .selection-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
          
          .checkbox-column {
            width: 40px;
            text-align: center;
          }
          
          .selected-row {
            background-color: #e8f4fd !important;
          }
          
          @media print {
            .filter-controls, .pagination-controls {
              display: none;
            }
          }
        `}
      </style>
      
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
          
          <div className="filter-controls">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="filter-box">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="sort-box">
              <FontAwesomeIcon icon={faSortAmountDown} />
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
            
            <div className="date-filter-box">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <button 
              className={`icon-button ${selectMode ? 'active' : ''}`} 
              title={selectMode ? "Exit Selection Mode" : "Enter Selection Mode"}
              onClick={toggleSelectMode}
            >
              <FontAwesomeIcon icon={selectMode ? faTimesCircle : faFilter} />
              {selectMode && getSelectedOrdersCount() > 0 && 
                <span className="selection-count">{getSelectedOrdersCount()}</span>
              }
            </button>
            
            <button 
              className="icon-button print" 
              title={getSelectedOrdersCount() > 0 ? `Print ${getSelectedOrdersCount()} Selected Orders` : "Print All Filtered Orders"}
              onClick={handlePrintOrders}
            >
              <FontAwesomeIcon icon={faPrint} />
            </button>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {selectMode && (
                    <th className="checkbox-column">
                      <input 
                        type="checkbox" 
                        checked={getCurrentPageOrders().length > 0 && getCurrentPageOrders().every(order => selectedOrders[order.id])}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
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
                    <tr key={order.id} className={selectedOrders[order.id] ? 'selected-row' : ''}>
                      {selectMode && (
                        <td className="checkbox-column">
                          <input 
                            type="checkbox" 
                            checked={!!selectedOrders[order.id]} 
                            onChange={() => toggleOrderSelection(order.id)}
                          />
                        </td>
                      )}
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>
                        {order.customerName || 
                         (order.customer?.name) || 
                         (order.customerInfo?.name) || 
                         (order.customerInfo?.firstName && order.customerInfo?.lastName ? 
                           `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
                           (order.customer?.firstName && order.customer?.lastName ? 
                             `${order.customer.firstName} ${order.customer.lastName}` : 
                             'Guest'))}
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items?.length || 0} items</td>
                      <td>{formatCurrency(order.total || order.totalAmount || 0)}</td>
                      <td>
                        {isUpdatingStatus === order.id ? (
                          <div className="status-updating">
                            <FontAwesomeIcon icon={faSpinner} spin /> Updating...
                          </div>
                        ) : (
                          <select 
                            className={`status-select ${getStatusClass(order.status)}`}
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="icon-button view" 
                          title="View Details"
                          onClick={() => handleViewOrder(order)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="icon-button print" 
                          title="Generate Invoice"
                          onClick={() => handleGenerateInvoice(order)}
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectMode ? 8 : 7} className="no-data">
                      {error ? error : 'No orders found matching your filters.'}
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
