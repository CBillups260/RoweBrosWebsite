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
  
  // Debug: Log the order structure
  console.log('Order details:', JSON.stringify(order, null, 2));
  
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
                  <span className="detail-value">
                    {order.customer?.name || 
                     order.customerInfo?.name ||
                     (order.customerInfo?.firstName && order.customerInfo?.lastName ? 
                       `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
                       (order.customer?.firstName && order.customer?.lastName ? 
                         `${order.customer.firstName} ${order.customer.lastName}` : 
                         'Unknown'))}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{order.customer?.email || order.customerInfo?.email || 'Not provided'}</span>
                </div>
              </div>
              <div className="detail-item">
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{order.customer?.phone || order.customerInfo?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-card">
              <h3>Shipping Address</h3>
              {(order.delivery || order.deliveryInfo) ? (
                <div className="detail-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <span className="detail-value address-line">
                      {typeof order.delivery?.address === 'object' 
                        ? order.delivery.address.line1 
                        : (order.delivery?.address || order.deliveryInfo?.address || 'No address provided')}
                    </span>
                    {(order.delivery?.city && order.delivery?.state) || (order.deliveryInfo?.city && order.deliveryInfo?.state) ? (
                      <span className="detail-value address-line">
                        {order.delivery?.city || order.deliveryInfo?.city}, 
                        {order.delivery?.state || order.deliveryInfo?.state} 
                        {order.delivery?.zipCode || order.deliveryInfo?.zipCode}
                      </span>
                    ) : null}
                    {(order.delivery?.date || order.deliveryInfo?.deliveryDate) && (
                      <span className="detail-value address-line">
                        <strong>Delivery Date:</strong> {formatDate(order.delivery?.date || order.deliveryInfo?.deliveryDate)}
                      </span>
                    )}
                    {(order.delivery?.time || order.deliveryInfo?.deliveryTime) && (
                      <span className="detail-value address-line">
                        <strong>Delivery Time:</strong> {order.delivery?.time || order.deliveryInfo?.deliveryTime}
                      </span>
                    )}
                    {(order.delivery?.instructions || order.deliveryInfo?.specialInstructions) && (
                      <span className="detail-value address-line">
                        <strong>Instructions:</strong> {order.delivery?.instructions || order.deliveryInfo?.specialInstructions}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="no-data">No shipping address provided</p>
              )}
            </div>
            
            <div className="detail-card">
              <h3>Debug Information</h3>
              <div style={{ overflowX: 'auto', maxHeight: '200px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                <pre>{JSON.stringify(order, null, 2)}</pre>
              </div>
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
                  <span>{formatCurrency(order.subtotal || (order.pricing?.subtotal) || 0)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping || order.deliveryFee || (order.pricing?.deliveryFee) || 0)}</span>
                </div>
                {(order.discount > 0 || order.pricing?.discount > 0) && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount || order.pricing?.discount || 0)}</span>
                  </div>
                )}
                {(order.tax > 0 || order.pricing?.tax > 0) && (
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax || order.pricing?.tax || 0)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(order.total || (order.pricing?.total) || 0)}</span>
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
