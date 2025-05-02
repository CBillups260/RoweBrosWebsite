import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faCalendarAlt, 
  faTruck, 
  faHome, 
  faPhone,
  faEnvelope,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/thank-you-page.css';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails, orderId } = location.state || {};

  // If no order details are present, redirect to home
  useEffect(() => {
    if (!orderDetails && !orderId) {
      navigate('/');
    }
  }, [orderDetails, orderId, navigate]);

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return typeof amount === 'number' 
      ? `$${amount.toFixed(2)}` 
      : amount;
  };

  // If no order details, show loading or redirect
  if (!orderDetails) {
    return <div className="loading">Redirecting to home page...</div>;
  }

  return (
    <div className="thank-you-page">
      <div className="container">
        <div className="thank-you-header">
          <div className="success-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h1>Thank You for Your Order!</h1>
          <p className="order-received">Your order has been received and is being processed.</p>
          <div className="order-number">
            Order Number: <span>{orderId}</span>
          </div>
          <p className="confirmation-email">
            A confirmation email has been sent to <strong>{orderDetails.customer?.email}</strong>
          </p>
        </div>

        <div className="order-details-card">
          <div className="card-section order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {orderDetails.items?.map((item, index) => (
                <div className="order-item" key={index}>
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-meta">
                      <span className="item-date">
                        <FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(item.date)}
                      </span>
                      {item.time && (
                        <span className="item-time">
                          Time: {item.time}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="item-quantity">
                    {item.quantity} × {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderDetails.pricing?.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee:</span>
                <span>{formatCurrency(orderDetails.pricing?.deliveryFee)}</span>
              </div>
              {orderDetails.pricing?.damageWaiver > 0 && (
                <div className="total-row">
                  <span>Damage Waiver:</span>
                  <span>{formatCurrency(orderDetails.pricing?.damageWaiver)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Tax:</span>
                <span>{formatCurrency(orderDetails.pricing?.tax)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>{formatCurrency(orderDetails.pricing?.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="card-section delivery-information">
            <h2>Delivery Information</h2>
            <div className="delivery-details">
              <p className="delivery-address">
                <FontAwesomeIcon icon={faTruck} />
                <span>
                  {orderDetails.delivery?.address}, 
                  {orderDetails.delivery?.city}, {orderDetails.delivery?.state} {orderDetails.delivery?.zipCode}
                </span>
              </p>
              <p className="delivery-date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>
                  Delivery Date: {formatDate(orderDetails.delivery?.date)}
                  {orderDetails.delivery?.time && ` at ${orderDetails.delivery?.time}`}
                </span>
              </p>
              {orderDetails.delivery?.instructions && (
                <p className="delivery-instructions">
                  <strong>Instructions:</strong> {orderDetails.delivery?.instructions}
                </p>
              )}
            </div>
          </div>
          
          <div className="card-section customer-information">
            <h2>Customer Information</h2>
            <div className="customer-details">
              <p className="customer-name">
                {orderDetails.customer?.name}
              </p>
              <p className="customer-email">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{orderDetails.customer?.email}</span>
              </p>
              <p className="customer-phone">
                <FontAwesomeIcon icon={faPhone} />
                <span>{orderDetails.customer?.phone}</span>
              </p>
            </div>
          </div>

          <div className="card-section payment-information">
            <h2>Payment Information</h2>
            <div className="payment-details">
              <p className="payment-method">
                <strong>Method:</strong> Credit Card
                {orderDetails.payment?.last4 && ` (ending in ${orderDetails.payment?.last4})`}
              </p>
              <p className="payment-status">
                <strong>Status:</strong> <span className="status-paid">Paid</span>
              </p>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h2>What's Next?</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Order Confirmation</h3>
              <p>We've sent a confirmation email with your order details.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Delivery Scheduling</h3>
              <p>Our team will contact you before your delivery date to confirm the time window.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Setup and Enjoyment</h3>
              <p>We'll handle the setup and takedown so you can focus on having fun!</p>
            </div>
          </div>
        </div>

        <div className="thank-you-actions">
          <button className="action-button print-receipt" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faPrint} /> Print Receipt
          </button>
          <Link to="/" className="action-button return-home">
            <FontAwesomeIcon icon={faHome} /> Return to Home
          </Link>
        </div>

        <div className="support-contact">
          <p>Have questions about your order? Contact our customer support:</p>
          <p className="support-phone">
            <FontAwesomeIcon icon={faPhone} /> (555) 123-4567
          </p>
          <p className="support-email">
            <FontAwesomeIcon icon={faEnvelope} /> support@rowentals.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; 