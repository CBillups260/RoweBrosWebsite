import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCalendarAlt, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faCreditCard,
  faTruck,
  faFileInvoice,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const OrderDetails = ({ order, onClose, onStatusUpdate }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
  
  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await onStatusUpdate(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Generate invoice
  const handleGenerateInvoice = () => {
    // In a real app, this would generate a PDF invoice
    alert(`Invoice for order ${order.id} would be generated here.`);
  };
  
  return (
    <div className="order-details">
      <div className="order-details-header">
        <div>
          <h2>Order Details</h2>
          <p className="order-id">Order ID: {order.id}</p>
        </div>
        <button className="icon-button close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="order-details-content">
        <div className="order-details-row">
          <div className="order-details-column">
            <div className="detail-card">
              <h3>Order Information</h3>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <span className="detail-label">Date Placed</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faTruck} />
                <div>
                  <span className="detail-label">Status</span>
                  <span className={`detail-value order-status ${getStatusClass(order.status)}`}>
                    {order.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faCreditCard} />
                <div>
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{order.paymentMethod || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-card">
              <h3>Customer Information</h3>
              <div className="detail-item">
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{order.customer?.name || 'Unknown'}</span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.customer?.email || 'Not provided'}</span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{order.customer?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-card">
              <h3>Shipping Address</h3>
              {order.shippingAddress ? (
                <div className="address-details">
                  <div className="detail-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="no-data">No shipping address provided</p>
              )}
            </div>
          </div>
          
          <div className="order-details-column">
            <div className="detail-card order-items-card">
              <h3>Order Items</h3>
              {order.items && order.items.length > 0 ? (
                <div className="order-items-list">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="product-info">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="product-thumbnail" />
                              )}
                              <div>
                                <p className="product-name">{item.name}</p>
                                {item.options && (
                                  <p className="product-options">
                                    {Object.entries(item.options).map(([key, value]) => 
                                      `${key}: ${value}`
                                    ).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No items in this order</p>
              )}
            </div>
            
            <div className="detail-card order-summary-card">
              <h3>Order Summary</h3>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-card actions-card">
              <h3>Actions</h3>
              <div className="order-actions">
                <div className="status-actions">
                  <p>Update Status:</p>
                  <div className="status-buttons">
                    <button 
                      className={`status-button pending ${order.status === 'Pending' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('Pending')}
                      disabled={updatingStatus || order.status === 'Pending'}
                    >
                      Pending
                    </button>
                    <button 
                      className={`status-button processing ${order.status === 'Processing' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('Processing')}
                      disabled={updatingStatus || order.status === 'Processing'}
                    >
                      Processing
                    </button>
                    <button 
                      className={`status-button completed ${order.status === 'Completed' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('Completed')}
                      disabled={updatingStatus || order.status === 'Completed'}
                    >
                      Completed
                    </button>
                    <button 
                      className={`status-button cancelled ${order.status === 'Cancelled' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate('Cancelled')}
                      disabled={updatingStatus || order.status === 'Cancelled'}
                    >
                      Cancelled
                    </button>
                  </div>
                  {updatingStatus && (
                    <div className="updating-status">
                      <FontAwesomeIcon icon={faSpinner} spin /> Updating status...
                    </div>
                  )}
                </div>
                
                <div className="other-actions">
                  <button className="action-button" onClick={handleGenerateInvoice}>
                    <FontAwesomeIcon icon={faFileInvoice} /> Generate Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
