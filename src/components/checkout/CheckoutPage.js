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
  faCheck,
  faClock,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createCheckoutSession } from '../../services/stripeService';
import '../../styles/checkout.css';

// Stripe Card Element styles
const cardElementOptions = {
  style: {
    base: {
      color: '#000',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
  hidePostalCode: true
};

// Stripe Payment Form Component
const StripePaymentForm = ({ paymentInfo, handlePaymentInfoChange, errors, onSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    const cardElement = elements.getElement(CardElement);
    
    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: paymentInfo.cardHolder,
      },
    });
    
    if (error) {
      setCardError(error.message);
      setProcessing(false);
      return;
    }
    
    // Pass the payment method to the parent component
    onSubmit(paymentMethod);
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
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
          placeholder="Name on card"
        />
        {errors.cardHolder && <div className="input-error">{errors.cardHolder}</div>}
      </div>
      
      <div className="form-group full-width">
        <label htmlFor="card-element">
          <FontAwesomeIcon icon={faCreditCard} /> Card Details
        </label>
        <div className="card-element-container">
          <CardElement id="card-element" options={cardElementOptions} onChange={handleCardChange} />
          <div className="card-security">
            <FontAwesomeIcon icon={faLock} /> Secure payment
          </div>
        </div>
        {cardError && <div className="input-error">{cardError}</div>}
      </div>
      
      <div className="form-group">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="savePaymentInfo"
            name="savePaymentInfo"
            checked={paymentInfo.savePaymentInfo}
            onChange={handlePaymentInfoChange}
          />
          <label htmlFor="savePaymentInfo">Save payment information for future orders</label>
        </div>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const [isGuest, setIsGuest] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Define service areas
  const serviceAreas = [
    { city: 'Elkhart', state: 'IN', zip: '46514' },
    { city: 'Elkhart', state: 'IN', zip: '46516' },
    { city: 'Elkhart', state: 'IN', zip: '46517' },
    { city: 'Angola', state: 'IN', zip: '46703' },
    { city: 'Goshen', state: 'IN', zip: '46526' },
    { city: 'Middlebury', state: 'IN', zip: '46540' },
    { city: 'Bristol', state: 'IN', zip: '46507' },
    { city: 'Mishawaka', state: 'IN', zip: '46544' },
    { city: 'South Bend', state: 'IN', zip: '46601' },
    { city: 'Sturgis', state: 'MI', zip: '49091' },
    { city: 'Three Rivers', state: 'MI', zip: '49093' }
  ];
  
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
    deliveryTime: '',
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
    } else {
      // Pre-fill delivery date and time from cart items if available
      const firstItem = cart.items[0];
      if (firstItem) {
        // Extract date from the first cart item
        let bookingDate = '';
        if (firstItem.date) {
          const date = new Date(firstItem.date);
          bookingDate = date.toISOString().split('T')[0];
        }
        
        // Extract time from the first cart item
        const bookingTime = firstItem.time || '';
        
        setDeliveryInfo(prev => ({
          ...prev,
          deliveryDate: bookingDate,
          deliveryTime: bookingTime
        }));
      }
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
    
    // Create updated delivery info
    const updatedDeliveryInfo = {
      ...deliveryInfo,
      [name]: value
    };
    
    // If city is changed, automatically set the state based on the selected city
    if (name === 'city' && value) {
      const selectedCity = serviceAreas.find(area => area.city === value);
      if (selectedCity) {
        updatedDeliveryInfo.state = selectedCity.state;
      }
    }
    
    // If zipCode is changed, make sure city and state are consistent
    if (name === 'zipCode' && value) {
      const selectedArea = serviceAreas.find(area => area.zip === value);
      if (selectedArea) {
        updatedDeliveryInfo.city = selectedArea.city;
        updatedDeliveryInfo.state = selectedArea.state;
      }
    }
    
    setDeliveryInfo(updatedDeliveryInfo);
    
    // Clear error for this field if it exists
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
    // Create a new errors object instead of modifying the existing one
    const newErrors = {};
    
    try {
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
        // Don't validate state since it's auto-selected based on city
        if (!deliveryInfo.zipCode) newErrors.zipCode = 'ZIP code is required';
        if (!deliveryInfo.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
        if (!deliveryInfo.deliveryTime) newErrors.deliveryTime = 'Delivery time is required';
      }
      
      if (step === 3) {
        if (!paymentInfo.cardHolder) newErrors.cardHolder = 'Card holder name is required';
        // Only check paymentMethod on the final submission
        // if (!paymentMethod) newErrors.cardElement = 'Please enter valid card details';
      }
      
      // Set the errors state with the new errors
      setErrors(newErrors);
      
      // Log validation results for debugging
      console.log('Validation errors for step', step, ':', newErrors);
      
      // Return true if there are no errors
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateStep:', error);
      // If there's an error, return true to allow proceeding to the next step
      // This prevents users from getting stuck if there's a validation bug
      return true;
    }
  };
  
  const goToNextStep = () => {
    // Clear any previous errors
    setErrors({});
    
    try {
      // Add console logging to help debug
      console.log('Current step:', activeStep);
      console.log('Validating step...');
      
      const isValid = validateStep(activeStep);
      console.log('Validation result:', isValid);
      console.log('Validation errors:', errors);
      
      if (isValid) {
        console.log('Moving to next step:', activeStep + 1);
        setActiveStep(prevStep => prevStep + 1);
      } else {
        console.log('Validation failed, staying on step:', activeStep);
      }
    } catch (error) {
      console.error('Error in goToNextStep:', error);
      // Show a user-friendly error message
      alert('There was an error processing your request. Please try again.');
    }
  };
  
  const goToPrevStep = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handlePaymentSubmit = (paymentMethodObj) => {
    setPaymentMethod(paymentMethodObj);
    goToNextStep();
  };
  
  const handlePlaceOrder = async () => {
    try {
      console.log('Placing order...');
      setIsProcessing(true);
      setPaymentError('');
      
      if (!paymentMethod) {
        console.log('Payment method missing');
        setPaymentError('Payment method is required');
        setIsProcessing(false);
        return;
      }
      
      // Calculate total amount
      const subtotal = Math.abs(cart.total);
      const deliveryFee = 50; // $50 delivery fee
      const tax = subtotal * 0.07; // 7% tax
      const total = subtotal + deliveryFee + tax;
      
      console.log('Order details:', { subtotal, deliveryFee, tax, total });
      
      // Create checkout session with Stripe
      console.log('Creating checkout session...');
      try {
        const { sessionId, orderId } = await createCheckoutSession(
          cart,
          customerInfo,
          deliveryInfo
        );
        
        console.log('Checkout session created:', { sessionId, orderId });
        
        // Store order ID for confirmation
        setOrderId(orderId);
        
        // Redirect to Stripe Checkout
        console.log('Redirecting to Stripe checkout...');
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({
          sessionId
        });
        
        if (error) {
          console.error('Stripe redirect error:', error);
          setPaymentError(error.message);
          setIsProcessing(false);
          return;
        }
        
        // Clear cart after successful order
        clearCart();
        
        // Show order confirmation
        setOrderComplete(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('Checkout session error:', error);
        setPaymentError(`Error creating checkout session: ${error.message}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setPaymentError('An error occurred while processing your payment. Please try again.');
      setIsProcessing(false);
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
        return null;
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
    // Determine the current state based on selected city
    const currentState = deliveryInfo.state || (deliveryInfo.city ? 
      serviceAreas.find(area => area.city === deliveryInfo.city)?.state || 'IN' : 'IN');

    return (
      <div className="form-section">
        <h2>Delivery Information</h2>
        <div className="service-area-notice">
          <FontAwesomeIcon icon={faTruck} />
          <p>We currently serve Elkhart, IN and Angola, IN and surrounding areas only.</p>
        </div>
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
            <select
              id="city"
              name="city"
              value={deliveryInfo.city}
              onChange={handleDeliveryInfoChange}
            >
              <option value="">Select a city</option>
              {/* Filter unique cities from service areas */}
              {[...new Set(serviceAreas.map(area => area.city))].map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <div className="input-error">{errors.city}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              name="state"
              value={currentState}
              onChange={handleDeliveryInfoChange}
              disabled
            >
              <option value="IN">Indiana</option>
              <option value="MI">Michigan</option>
            </select>
            <div className="field-note">We only serve IN and MI</div>
            {errors.state && <div className="input-error">{errors.state}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <select
              id="zipCode"
              name="zipCode"
              value={deliveryInfo.zipCode}
              onChange={handleDeliveryInfoChange}
            >
              <option value="">Select a ZIP code</option>
              {/* Filter ZIP codes based on selected city */}
              {deliveryInfo.city ? 
                serviceAreas
                  .filter(area => area.city === deliveryInfo.city)
                  .map((area, index) => (
                    <option key={index} value={area.zip}>{area.zip}</option>
                  ))
                : 
                <option value="" disabled>Select a city first</option>
              }
            </select>
            {errors.zipCode && <div className="input-error">{errors.zipCode}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="deliveryDate">
              <FontAwesomeIcon icon={faCalendarAlt} /> Delivery Date
            </label>
            <div className="pre-selected-field">
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={deliveryInfo.deliveryDate}
                onChange={handleDeliveryInfoChange}
                min={new Date().toISOString().split('T')[0]}
                className="pre-filled-input"
                readOnly={!!deliveryInfo.deliveryDate}
              />
              {deliveryInfo.deliveryDate && (
                <div className="pre-selected-badge">
                  <FontAwesomeIcon icon={faCheck} /> Pre-selected
                </div>
              )}
            </div>
            {errors.deliveryDate && <div className="input-error">{errors.deliveryDate}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="deliveryTime">
              <FontAwesomeIcon icon={faClock} /> Delivery Time
            </label>
            <div className="pre-selected-field">
              <select
                id="deliveryTime"
                name="deliveryTime"
                value={deliveryInfo.deliveryTime}
                onChange={handleDeliveryInfoChange}
                className="pre-filled-input"
                disabled={!!deliveryInfo.deliveryTime}
              >
                <option value="">Select a time</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="3:00 PM">3:00 PM</option>
                <option value="4:00 PM">4:00 PM</option>
                <option value="5:00 PM">5:00 PM</option>
              </select>
              {deliveryInfo.deliveryTime && (
                <div className="pre-selected-badge">
                  <FontAwesomeIcon icon={faCheck} /> Pre-selected
                </div>
              )}
            </div>
            {errors.deliveryTime && <div className="input-error">{errors.deliveryTime}</div>}
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
        <p className="secure-payment-note">
          <FontAwesomeIcon icon={faLock} /> All transactions are secure and encrypted
        </p>
        
        <Elements stripe={getStripe()}>
          <StripePaymentForm 
            paymentInfo={paymentInfo}
            handlePaymentInfoChange={handlePaymentInfoChange}
            errors={errors}
            onSubmit={handlePaymentSubmit}
          />
        </Elements>
        
        <div className="payment-methods">
          <div className="payment-method-title">Accepted Payment Methods</div>
          <div className="payment-icons">
            <img src="/images/visa.svg" alt="Visa" className="payment-icon" />
            <img src="/images/mastercard.svg" alt="Mastercard" className="payment-icon" />
            <img src="/images/amex.svg" alt="American Express" className="payment-icon" />
            <img src="/images/discover.svg" alt="Discover" className="payment-icon" />
          </div>
        </div>
      </div>
    );
  };
  
  const renderOrderReview = () => {
    return (
      <div className="form-section">
        <h2>Review Your Order</h2>
        
        <div className="review-sections">
          <div className="review-section">
            <h3>Customer Information</h3>
            <div className="review-details">
              <p><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
              <p><strong>Email:</strong> {customerInfo.email}</p>
              <p><strong>Phone:</strong> {customerInfo.phone}</p>
            </div>
          </div>
          
          <div className="review-section">
            <h3>Delivery Information</h3>
            <div className="review-details">
              <p><strong>Address:</strong> {deliveryInfo.address}</p>
              <p><strong>City:</strong> {deliveryInfo.city}, {deliveryInfo.state} {deliveryInfo.zipCode}</p>
              <p><strong>Delivery Date:</strong> {new Date(deliveryInfo.deliveryDate).toLocaleDateString()}</p>
              <p><strong>Delivery Time:</strong> {deliveryInfo.deliveryTime}</p>
              {deliveryInfo.deliveryInstructions && (
                <p><strong>Instructions:</strong> {deliveryInfo.deliveryInstructions}</p>
              )}
            </div>
          </div>
          
          <div className="review-section">
            <h3>Payment Information</h3>
            <div className="review-details">
              <p><strong>Card Holder:</strong> {paymentInfo.cardHolder}</p>
              <p><strong>Card Number:</strong> **** **** **** {paymentMethod.card.last4}</p>
              <p><strong>Expiration:</strong> {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</p>
            </div>
          </div>
        </div>
        
        <div className="terms-agreement">
          <p>By placing your order, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
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
          <p>Delivery Time: {deliveryInfo.deliveryTime}</p>
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
      <div className="container">
        {orderComplete ? (
          renderOrderConfirmation()
        ) : (
          <>
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
                        <p className="item-rental-date">Date: {new Date(item.date).toLocaleDateString()}</p>
                        <p className="item-rental-time">Time: {item.time}</p>
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
            
            {paymentError && (
              <div className="payment-error">
                <FontAwesomeIcon icon={faTimes} /> {paymentError}
              </div>
            )}
            
            <div className="checkout-navigation">
              {activeStep > 1 && (
                <button onClick={goToPrevStep} className="prev-button" disabled={isProcessing}>
                  Back
                </button>
              )}
              
              {activeStep < 4 ? (
                <button onClick={goToNextStep} className="next-button" disabled={isProcessing}>
                  Continue <FontAwesomeIcon icon={faChevronRight} />
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder} 
                  className="place-order-button" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'} 
                  {!isProcessing && <FontAwesomeIcon icon={faCheck} />}
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
