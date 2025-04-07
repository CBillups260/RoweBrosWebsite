import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronRight, 
  faCreditCard, 
  faCalendarAlt, 
  faLock,
  faUser,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faTruck,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import '../../styles/checkout.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const [isGuest, setIsGuest] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryDate: '',
    deliveryInstructions: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardHolder: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    savePaymentInfo: false
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Check if user is coming as a guest
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'guest') {
      setIsGuest(true);
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn && !isGuest) {
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user) {
        setCustomerInfo({
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || ''
        });
      }
    }
    
    // Check if cart is empty
    if (!cart || cart.items.length === 0) {
      navigate('/rentals');
    }
  }, [location, navigate, cart, isGuest]);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo({
      ...deliveryInfo,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handlePaymentInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!customerInfo.firstName) newErrors.firstName = 'First name is required';
      if (!customerInfo.lastName) newErrors.lastName = 'Last name is required';
      if (!customerInfo.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = 'Email is invalid';
      if (!customerInfo.phone) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (!deliveryInfo.address) newErrors.address = 'Address is required';
      if (!deliveryInfo.city) newErrors.city = 'City is required';
      if (!deliveryInfo.state) newErrors.state = 'State is required';
      if (!deliveryInfo.zipCode) newErrors.zipCode = 'ZIP code is required';
      if (!deliveryInfo.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
    }
    
    if (step === 3) {
      if (!paymentInfo.cardHolder) newErrors.cardHolder = 'Card holder name is required';
      if (!paymentInfo.cardNumber) newErrors.cardNumber = 'Card number is required';
      else if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = 'Card number must be 16 digits';
      if (!paymentInfo.expMonth) newErrors.expMonth = 'Expiration month is required';
      if (!paymentInfo.expYear) newErrors.expYear = 'Expiration year is required';
      if (!paymentInfo.cvv) newErrors.cvv = 'CVV is required';
      else if (paymentInfo.cvv.length < 3) newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const goToNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPrevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handlePlaceOrder = async () => {
    if (!validateStep(activeStep)) return;
    
    try {
      // Save order to localStorage
      const orderId = `ORDER-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = {
        id: orderId,
        date: new Date().toISOString(),
        customerInfo,
        deliveryInfo,
        items: cart.items,
        subtotal: cart.total,
        deliveryFee: 50,
        tax: Number((cart.total * 0.07).toFixed(2)),
        total: Number((cart.total + 50 + cart.total * 0.07).toFixed(2)),
        status: 'pending'
      };
      
      // Get existing orders or initialize empty array
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      
      // Save updated orders
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // If user is logged in, associate order with user
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userOrders = user.orders || [];
        userOrders.push(orderId);
        user.orders = userOrders;
        
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Update UI
      setOrderComplete(true);
      setOrderId(orderId);
      
      // Clear cart
      clearCart();
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({
        form: 'There was an error processing your order. Please try again.'
      });
    }
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderCustomerInfoForm();
      case 2:
        return renderDeliveryInfoForm();
      case 3:
        return renderPaymentForm();
      case 4:
        return renderOrderReview();
      default:
        return renderCustomerInfoForm();
    }
  };

  const renderCustomerInfoForm = () => {
    return (
      <div className="form-section">
        <h2>Customer Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">
              <FontAwesomeIcon icon={faUser} /> First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={customerInfo.firstName}
              onChange={handleCustomerInfoChange}
              placeholder="Enter your first name"
            />
            {errors.firstName && <div className="input-error">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">
              <FontAwesomeIcon icon={faUser} /> Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={customerInfo.lastName}
              onChange={handleCustomerInfoChange}
              placeholder="Enter your last name"
            />
            {errors.lastName && <div className="input-error">{errors.lastName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email}
              onChange={handleCustomerInfoChange}
              placeholder="Enter your email"
            />
            {errors.email && <div className="input-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">
              <FontAwesomeIcon icon={faPhone} /> Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              placeholder="Enter your phone number"
            />
            {errors.phone && <div className="input-error">{errors.phone}</div>}
          </div>
        </div>
      </div>
    );
  };
  
  const renderDeliveryInfoForm = () => {
    return (
      <div className="form-section">
        <h2>Delivery Information</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="address">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={deliveryInfo.address}
              onChange={handleDeliveryInfoChange}
              placeholder="Enter your street address"
            />
            {errors.address && <div className="input-error">{errors.address}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={deliveryInfo.city}
              onChange={handleDeliveryInfoChange}
              placeholder="Enter your city"
            />
            {errors.city && <div className="input-error">{errors.city}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              name="state"
              value={deliveryInfo.state}
              onChange={handleDeliveryInfoChange}
            >
              <option value="">Select a state</option>
              <option value="IN">Indiana</option>
              <option value="MI">Michigan</option>
              <option value="OH">Ohio</option>
              <option value="IL">Illinois</option>
              <option value="KY">Kentucky</option>
            </select>
            {errors.state && <div className="input-error">{errors.state}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={deliveryInfo.zipCode}
              onChange={handleDeliveryInfoChange}
              placeholder="Enter your ZIP code"
            />
            {errors.zipCode && <div className="input-error">{errors.zipCode}</div>}
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="deliveryDate">
              <FontAwesomeIcon icon={faCalendarAlt} /> Delivery Date
            </label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={deliveryInfo.deliveryDate}
              onChange={handleDeliveryInfoChange}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.deliveryDate && <div className="input-error">{errors.deliveryDate}</div>}
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="deliveryInstructions">
              <FontAwesomeIcon icon={faTruck} /> Delivery Instructions (Optional)
            </label>
            <textarea
              id="deliveryInstructions"
              name="deliveryInstructions"
              value={deliveryInfo.deliveryInstructions}
              onChange={handleDeliveryInfoChange}
              placeholder="Any special instructions for delivery?"
              rows="3"
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderPaymentForm = () => {
    return (
      <div className="form-section">
        <h2>Payment Information</h2>
        <div className="secure-payment-notice">
          <FontAwesomeIcon icon={faLock} />
          <span>Your payment information is secure and encrypted</span>
        </div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="cardHolder">
              <FontAwesomeIcon icon={faUser} /> Card Holder Name
            </label>
            <input
              type="text"
              id="cardHolder"
              name="cardHolder"
              value={paymentInfo.cardHolder}
              onChange={handlePaymentInfoChange}
              placeholder="Name as it appears on card"
            />
            {errors.cardHolder && <div className="input-error">{errors.cardHolder}</div>}
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="cardNumber">
              <FontAwesomeIcon icon={faCreditCard} /> Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentInfoChange}
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength="19"
            />
            {errors.cardNumber && <div className="input-error">{errors.cardNumber}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="expMonth">Expiration Month</label>
            <select
              id="expMonth"
              name="expMonth"
              value={paymentInfo.expMonth}
              onChange={handlePaymentInfoChange}
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                return (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </option>
                );
              })}
            </select>
            {errors.expMonth && <div className="input-error">{errors.expMonth}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="expYear">Expiration Year</label>
            <select
              id="expYear"
              name="expYear"
              value={paymentInfo.expYear}
              onChange={handlePaymentInfoChange}
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            {errors.expYear && <div className="input-error">{errors.expYear}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={paymentInfo.cvv}
              onChange={handlePaymentInfoChange}
              placeholder="XXX"
              maxLength="4"
            />
            {errors.cvv && <div className="input-error">{errors.cvv}</div>}
          </div>
          
          {!isGuest && (
            <div className="form-group full-width checkbox-group">
              <input
                type="checkbox"
                id="savePaymentInfo"
                name="savePaymentInfo"
                checked={paymentInfo.savePaymentInfo}
                onChange={handlePaymentInfoChange}
              />
              <label htmlFor="savePaymentInfo">Save payment information for future orders</label>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderOrderReview = () => {
    return (
      <div className="form-section">
        <h2>Review Your Order</h2>
        
        <div className="review-section">
          <h3>Customer Information</h3>
          <div className="review-content">
            <p><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
            <p><strong>Email:</strong> {customerInfo.email}</p>
            <p><strong>Phone:</strong> {customerInfo.phone}</p>
          </div>
          <button onClick={() => setActiveStep(1)} className="edit-button">Edit</button>
        </div>
        
        <div className="review-section">
          <h3>Delivery Information</h3>
          <div className="review-content">
            <p><strong>Address:</strong> {deliveryInfo.address}</p>
            <p><strong>City, State ZIP:</strong> {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
            <p><strong>Delivery Date:</strong> {new Date(deliveryInfo.deliveryDate).toLocaleDateString()}</p>
            {deliveryInfo.deliveryInstructions && (
              <p><strong>Instructions:</strong> {deliveryInfo.deliveryInstructions}</p>
            )}
          </div>
          <button onClick={() => setActiveStep(2)} className="edit-button">Edit</button>
        </div>
        
        <div className="review-section">
          <h3>Payment Method</h3>
          <div className="review-content">
            <p><strong>Card Holder:</strong> {paymentInfo.cardHolder}</p>
            <p><strong>Card Number:</strong> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
            <p><strong>Expiration:</strong> {paymentInfo.expMonth}/{paymentInfo.expYear}</p>
          </div>
          <button onClick={() => setActiveStep(3)} className="edit-button">Edit</button>
        </div>
        
        <div className="terms-agreement">
          <p>
            By placing your order, you agree to RoweBros Party Rentals' <a href="/terms">Terms and Conditions</a> and acknowledge that your credit card will be charged for the total amount shown.
          </p>
        </div>
      </div>
    );
  };
  
  const renderOrderConfirmation = () => {
    return (
      <div className="order-confirmation">
        <div className="confirmation-icon">
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <h1>Thank You for Your Order!</h1>
        <p className="confirmation-message">
          Your order has been successfully placed. A confirmation email has been sent to {customerInfo.email}.
        </p>
        
        <div className="confirmation-details">
          <h3>Order Details</h3>
          <p className="order-id">Order #: {orderId}</p>
          <p className="order-date">Date: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="delivery-details">
          <h3>Delivery Information</h3>
          <p>{customerInfo.firstName} {customerInfo.lastName}</p>
          <p>{deliveryInfo.address}</p>
          <p>{deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
          <p>Delivery Date: {new Date(deliveryInfo.deliveryDate).toLocaleDateString()}</p>
        </div>
        
        <div className="order-summary confirmation">
          <h3>Order Summary</h3>
          <div className="order-items">
            {cart.items.map(item => (
              <div key={`${item.id}-${item.date}`} className="order-item">
                <div className="item-image">
                  <img src={item.mainImage || item.image || "https://via.placeholder.com/60x60"} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-rental-date">Rental Date: {new Date(item.date).toLocaleDateString()}</p>
                </div>
                <div className="item-price">${item.priceNumeric}</div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="order-subtotal">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="order-delivery">
              <span>Delivery Fee</span>
              <span>$50.00</span>
            </div>
            <div className="order-tax">
              <span>Tax (7%)</span>
              <span>${(cart.total * 0.07).toFixed(2)}</span>
            </div>
            <div className="order-total">
              <span>Total</span>
              <span>${(cart.total + 50 + cart.total * 0.07).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <button onClick={() => navigate('/')} className="home-button">
            Return to Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {orderComplete ? (
          renderOrderConfirmation()
        ) : (
          <>
            <h1 className="checkout-title">Checkout</h1>
            {isGuest && (
              <div className="guest-checkout-banner">
                <p>
                  You're checking out as a guest. 
                  <button onClick={() => navigate('/login?redirect=checkout')} className="guest-login-link">
                    Login for a faster experience
                  </button>
                </p>
              </div>
            )}
            
            <div className="checkout-progress">
              <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Customer Info</div>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Delivery</div>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Payment</div>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Review</div>
              </div>
            </div>
            
            <div className="checkout-content">
              <div className="checkout-form-container">
                {renderStepContent()}
              </div>
              
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="order-items">
                  {cart.items.map(item => (
                    <div key={`${item.id}-${item.date}`} className="order-item">
                      <div className="item-image">
                        <img src={item.mainImage || item.image || "https://via.placeholder.com/60x60"} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-quantity">Quantity: {item.quantity}</p>
                        <p className="item-rental-date">Rental Date: {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <div className="item-price">${item.priceNumeric}</div>
                    </div>
                  ))}
                </div>
                
                <div className="order-totals">
                  <div className="order-subtotal">
                    <span>Subtotal</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="order-delivery">
                    <span>Delivery Fee</span>
                    <span>$50.00</span>
                  </div>
                  <div className="order-tax">
                    <span>Tax (7%)</span>
                    <span>${(cart.total * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="order-total">
                    <span>Total</span>
                    <span>${(cart.total + 50 + cart.total * 0.07).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="checkout-navigation">
              {activeStep > 1 && (
                <button onClick={goToPrevStep} className="prev-button">
                  Back
                </button>
              )}
              
              {activeStep < 4 ? (
                <button onClick={goToNextStep} className="next-button">
                  Continue <FontAwesomeIcon icon={faChevronRight} />
                </button>
              ) : (
                <button onClick={handlePlaceOrder} className="place-order-button">
                  Place Order <FontAwesomeIcon icon={faCheck} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
