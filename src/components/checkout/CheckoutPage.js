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
import { 
  createPaymentIntent,
  processPayment,
  extractPriceNumeric,
  getStripe
} from '../../services/stripeService';
import { auth } from '../../firebase';
import '../../styles/checkout.css';
import PlaceholderImage from '../common/PlaceholderImage';

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
    console.log('[StripePaymentForm] Created paymentMethod:', paymentMethod, 'Error:', error);
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
    <form className="stripe-payment-form" onSubmit={handleSubmit} autoComplete="off">
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
      <button
        type="submit"
        className="btn btn-primary stripe-submit-btn"
        disabled={processing}
        style={{
          width: '100%',
          background: '#fff',
          color: '#111',
          border: '2px solid #111',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '0.9em',
          marginTop: '1.2em',
          cursor: processing ? 'not-allowed' : 'pointer',
        }}
      >
        {processing ? 'Processing...' : 'Continue'}
      </button>
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
  const [paymentStatus, setPaymentStatus] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(50); // Default delivery fee
  const [selectedBranch, setSelectedBranch] = useState('');
  const [mileageDistance, setMileageDistance] = useState(0);
  const [feeCalculated, setFeeCalculated] = useState(false); // Track if delivery fee has been calculated
  
  // Define service areas with approximate distance in miles from each branch
  const serviceAreas = [
    // Elkhart area
    { city: 'Elkhart', state: 'IN', zip: '46514', distances: { elkhart: 3, angola: 75 } },
    { city: 'Elkhart', state: 'IN', zip: '46516', distances: { elkhart: 1, angola: 70 } },
    { city: 'Elkhart', state: 'IN', zip: '46517', distances: { elkhart: 5, angola: 77 } },
    { city: 'Goshen', state: 'IN', zip: '46526', distances: { elkhart: 12, angola: 82 } },
    { city: 'Middlebury', state: 'IN', zip: '46540', distances: { elkhart: 18, angola: 60 } },
    { city: 'Bristol', state: 'IN', zip: '46507', distances: { elkhart: 14, angola: 64 } },
    { city: 'Mishawaka', state: 'IN', zip: '46544', distances: { elkhart: 25, angola: 95 } },
    { city: 'South Bend', state: 'IN', zip: '46601', distances: { elkhart: 28, angola: 100 } },
    { city: 'Nappanee', state: 'IN', zip: '46550', distances: { elkhart: 22, angola: 88 } },
    { city: 'Wakarusa', state: 'IN', zip: '46573', distances: { elkhart: 15, angola: 87 } },
    { city: 'Edwardsburg', state: 'MI', zip: '49112', distances: { elkhart: 12, angola: 80 } },
    { city: 'Cassopolis', state: 'MI', zip: '49031', distances: { elkhart: 25, angola: 91 } },
    { city: 'Constantine', state: 'MI', zip: '49042', distances: { elkhart: 25, angola: 48 } },
    
    // Angola area
    { city: 'Angola', state: 'IN', zip: '46703', distances: { elkhart: 70, angola: 3 } },
    { city: 'Sturgis', state: 'MI', zip: '49091', distances: { elkhart: 40, angola: 30 } },
    { city: 'Three Rivers', state: 'MI', zip: '49093', distances: { elkhart: 55, angola: 40 } },
    { city: 'Coldwater', state: 'MI', zip: '49036', distances: { elkhart: 65, angola: 25 } },
    { city: 'LaGrange', state: 'IN', zip: '46761', distances: { elkhart: 28, angola: 25 } },
    { city: 'Auburn', state: 'IN', zip: '46706', distances: { elkhart: 60, angola: 18 } },
    { city: 'Kendallville', state: 'IN', zip: '46755', distances: { elkhart: 45, angola: 22 } },
    { city: 'Butler', state: 'IN', zip: '46721', distances: { elkhart: 70, angola: 25 } },
    { city: 'Waterloo', state: 'IN', zip: '46793', distances: { elkhart: 64, angola: 20 } },
    { city: 'Hamilton', state: 'IN', zip: '46742', distances: { elkhart: 75, angola: 12 } },
    { city: 'Fremont', state: 'IN', zip: '46737', distances: { elkhart: 82, angola: 10 } },
    { city: 'Hudson', state: 'IN', zip: '46747', distances: { elkhart: 68, angola: 15 } },
    { city: 'Orland', state: 'IN', zip: '46776', distances: { elkhart: 45, angola: 12 } },
    { city: 'Pleasant Lake', state: 'IN', zip: '46779', distances: { elkhart: 65, angola: 8 } },
    { city: 'Rome City', state: 'IN', zip: '46784', distances: { elkhart: 35, angola: 25 } },
    
    // Additional locations within 25 miles of both centers
    { city: 'White Pigeon', state: 'MI', zip: '49099', distances: { elkhart: 22, angola: 35 } },
    { city: 'Howe', state: 'IN', zip: '46746', distances: { elkhart: 24, angola: 23 } },
    { city: 'Shipshewana', state: 'IN', zip: '46565', distances: { elkhart: 25, angola: 35 } },
    { city: 'Topeka', state: 'IN', zip: '46571', distances: { elkhart: 27, angola: 40 } },
    { city: 'Wolcottville', state: 'IN', zip: '46795', distances: { elkhart: 33, angola: 21 } },
    { city: 'Albion', state: 'IN', zip: '46701', distances: { elkhart: 40, angola: 25 } }
  ];
  
  // Branch locations
  const branchLocations = {
    angola: {
      address: '15 Kodak Ln',
      city: 'Angola',
      state: 'IN',
      zip: '46703'
    },
    elkhart: {
      address: '56551 Mars Dr',
      city: 'Elkhart',
      state: 'IN',
      zip: '46516'
    }
  };

  // Calculate delivery fee based on mileage
  const calculateMileageBasedFee = (distanceInMiles) => {
    // Simple $2 per mile calculation with a minimum fee of $20
    const calculatedFee = Math.ceil(distanceInMiles * 2);
    return Math.max(calculatedFee, 20); // Ensure minimum fee of $20
  };

  // Delivery fee calculation based on mileage from the closest branch
  const calculateDeliveryFee = (city, zipCode) => {
    // Find the service area in our database
    const area = serviceAreas.find(area => 
      area.city.toLowerCase() === city.toLowerCase() && area.zip === zipCode
    );
    
    if (!area) {
      setMileageDistance(0);
      setFeeCalculated(false); // Reset flag if area not found
      return 50; // Default delivery fee if area not found
    }
    
    // Get distances from both branches
    const elkhart_distance = area.distances.elkhart;
    const angola_distance = area.distances.angola;
    
    // Determine which branch is closer
    const closerBranch = elkhart_distance <= angola_distance ? 'elkhart' : 'angola';
    const distance = Math.min(elkhart_distance, angola_distance);
    
    // Set the selected branch and distance for display purposes
    setSelectedBranch(closerBranch);
    setMileageDistance(distance);
    
    // Calculate fee based on mileage
    const fee = calculateMileageBasedFee(distance);
    
    // Set fee calculated flag to true
    setFeeCalculated(true);
    
    return fee;
  };
  
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
  
  // Add new state for liability waiver
  const [liabilityWaiver, setLiabilityWaiver] = useState({
    termsAgreed: false,
    purchaseDamageWaiver: false
  });

  // Add handler for liability waiver inputs
  const handleLiabilityWaiverChange = (e) => {
    const { name, checked } = e.target;
    setLiabilityWaiver({
      ...liabilityWaiver,
      [name]: checked
    });
  };
  
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
    
    // Calculate delivery fee when both city and zip code are selected
    if (updatedDeliveryInfo.city && updatedDeliveryInfo.zipCode) {
      const fee = calculateDeliveryFee(updatedDeliveryInfo.city, updatedDeliveryInfo.zipCode);
      setDeliveryFee(fee);
    } else {
      // Reset fee calculated flag if either city or zip is not set
      setFeeCalculated(false);
    }
    
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

      // Add validation for liability waiver step
      if (step === 3) {
        if (!liabilityWaiver.termsAgreed) newErrors.termsAgreed = 'You must agree to the terms and conditions';
      }
      
      if (step === 4) {
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
    console.log('[CheckoutPage] Payment method received in handlePaymentSubmit:', paymentMethodObj);
    setPaymentMethod(paymentMethodObj);
    // Store payment method in session storage to persist between steps
    try {
      sessionStorage.setItem('roweBros_paymentMethod', JSON.stringify(paymentMethodObj));
      console.log('[CheckoutPage] Payment method saved to sessionStorage:', paymentMethodObj);
    } catch (error) {
      console.error('[CheckoutPage] Error storing payment method:', error);
    }
    goToNextStep();
  };
  
  const buildDeliveryInfoForStripe = (deliveryInfo) => {
    // If address is already an object with line1, return as is
    if (deliveryInfo && typeof deliveryInfo.address === 'object' && deliveryInfo.address !== null && deliveryInfo.address.line1 !== undefined) {
      return deliveryInfo;
    }
    // If address is a string or missing, build the object for Stripe
    return {
      ...deliveryInfo,
      address: {
        line1: deliveryInfo.address || '',
        line2: '',
        city: deliveryInfo.city || '',
        state: deliveryInfo.state || '',
        postal_code: deliveryInfo.zipCode || '',
        country: 'US',
      },
    };
  };

  const handlePlaceOrder = async () => {
    try {
      console.log('Placing order...');
      setIsProcessing(true);
      setPaymentError('');
      
      // Try to load payment method from session storage if not in state
      let paymentMethodToUse = paymentMethod;
      console.log('[CheckoutPage] Payment method at start of handlePlaceOrder:', paymentMethodToUse);
      if (!paymentMethodToUse) {
        try {
          const savedPaymentMethod = sessionStorage.getItem('roweBros_paymentMethod');
          if (savedPaymentMethod) {
            paymentMethodToUse = JSON.parse(savedPaymentMethod);
            setPaymentMethod(paymentMethodToUse);
            console.log('[CheckoutPage] Loaded payment method from session storage for order placement:', paymentMethodToUse);
          }
        } catch (error) {
          console.error('[CheckoutPage] Error loading payment method from session storage:', error);
        }
      }
      
      if (!paymentMethodToUse) {
        console.log('[CheckoutPage] Payment method missing at order placement');
        setPaymentError('Payment method is required. Please go back to the payment step and enter your card details.');
        setIsProcessing(false);
        return;
      }
      
      // STEP 1: Create a payment intent
      console.log('Creating payment intent...');
      const deliveryForStripe = buildDeliveryInfoForStripe(deliveryInfo);
      console.log('[CheckoutPage] Delivery info being sent to Stripe:', deliveryForStripe);
      
      // Calculate total amount in cents with damage waiver if selected
      const damageWaiverAmount = liabilityWaiver.purchaseDamageWaiver ? cart.total * 0.1 : 0;
      const amount = Math.round((cart.total + damageWaiverAmount + 50 + (cart.total * 0.07)) * 100);
      
      const { clientSecret, paymentIntentId } = await createPaymentIntent(
        amount,
        customerInfo,
        deliveryForStripe,
        cart
      );
      
      console.log('Payment intent created:', { paymentIntentId, clientSecret });
      
      // STEP 2: Process the payment with the payment method
      console.log('Processing payment...');
      const result = await processPayment(clientSecret, paymentMethodToUse);
      
      console.log('Payment processed:', result);
      
      if (result.success) {
        // STEP 3: Save the order to Firebase
        console.log('Saving order to database...');
        try {
          const response = await fetch('/.netlify/functions/save-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: result.paymentIntentId,
              customerInfo,
              deliveryInfo,
              cartItems: cart.items,
              liabilityWaiver,
              damageWaiverCost: damageWaiverAmount,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Server error:', errorData);
            throw new Error(`Server error: ${response.status} ${errorData}`);
          }

          const orderData = await response.json();
          console.log('Order saved successfully:', orderData);
          
          // Clear the cart
          clearCart();
          
          // Show success message and redirect to confirmation page
          setPaymentStatus('success');
          setOrderId(orderData.orderId);
          
          // Redirect to confirmation page
          navigate('/confirmation', { 
            state: { 
              orderId: orderData.orderId,
              orderDetails: orderData.orderDetails
            } 
          });
          
          return true;
        } catch (error) {
          console.error('Error saving order to database:', error);
          setPaymentStatus('error');
          setPaymentError(`Error saving order: ${error.message}`);
          return false;
        }
      } else {
        setPaymentError('Payment processing failed. Please try again.');
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error placing order:', error);
      setPaymentError(`An error occurred while processing your payment: ${error.message}`);
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
        return renderLiabilityWaiverForm();
      case 4:
        return renderPaymentForm();
      case 5:
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
          <p>We currently serve Elkhart, IN and Angola, IN and surrounding areas. Delivery fees are calculated based on mileage.</p>
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
  
  const renderLiabilityWaiverForm = () => {
    const damageWaiverCost = (cart.total * 0.1).toFixed(2);
    
    return (
      <div className="form-section">
        <h2>Liability Waiver</h2>
        
        <div className="waiver-container">
          <div className="waiver-text">
            <p>By checking this box, I acknowledge that I understand and agree to the following:</p>
            <p>If anything happens to the products provided, I am responsible for the products. I agree to Rowe Bros' terms and conditions.</p>
          </div>
          
          <div className="waiver-acceptance">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={liabilityWaiver.termsAgreed}
                  onChange={handleLiabilityWaiverChange}
                />
                <span>I agree to the terms and conditions</span>
              </label>
              {errors.termsAgreed && <div className="input-error">{errors.termsAgreed}</div>}
            </div>
          </div>
          
          <div className="damage-waiver-container">
            <h3>Damage Waiver Option</h3>
            <p>Would you like to purchase our Damage Waiver? For 10% of your total rental costs (${damageWaiverCost}), we will waive any damage that happens to our equipment during your possession of said equipment, excluding intentional damage or theft.</p>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="purchaseDamageWaiver"
                  checked={liabilityWaiver.purchaseDamageWaiver}
                  onChange={handleLiabilityWaiverChange}
                />
                <span>Yes, I would like to purchase the Damage Waiver (10% - ${damageWaiverCost})</span>
              </label>
            </div>
          </div>
          
          <div className="additional-info">
            <div className="info-box">
              <h4>Important Information</h4>
              <ul>
                <li>Please note that we do require a Minimum Payment up front upon checkout that is not refundable, but will be credited toward the full balance.</li>
                <li>If you cancel within the 7 days prior to the event, we will retain that Minimum Payment in a Raincheck, good for one full year toward a future event.</li>
                <li>If you cancel before the 7 days leading up to the Event, your full balance can be refunded or placed in a Raincheck, whichever you prefer.</li>
                <li>Please note that we do require electricity per unit within 50' of the setup area.</li>
              </ul>
            </div>
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
              {selectedBranch && (
                <p><strong>Serving Branch:</strong> {branchLocations[selectedBranch].city} ({branchLocations[selectedBranch].address}) - {mileageDistance} miles away</p>
              )}
            </div>
          </div>
          
          <div className="review-section">
            <h3>Liability & Damage Waiver</h3>
            <div className="review-details">
              <p><strong>Terms & Conditions:</strong> Agreed</p>
              <p><strong>Damage Waiver:</strong> {liabilityWaiver.purchaseDamageWaiver ? 'Purchased' : 'Declined'}</p>
              {liabilityWaiver.purchaseDamageWaiver && (
                <p><strong>Damage Waiver Fee:</strong> ${(cart.total * 0.1).toFixed(2)} (10% of rental total)</p>
              )}
            </div>
          </div>
          
          <div className="review-section">
            <h3>Payment Information</h3>
            <div className="review-details">
              <p><strong>Card Holder:</strong> {paymentInfo.cardHolder}</p>
              {paymentMethod && paymentMethod.card ? (
                <>
                  <p><strong>Card Number:</strong> **** **** **** {paymentMethod.card.last4}</p>
                  <p><strong>Expiration:</strong> {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</p>
                </>
              ) : (
                <p>Card details will be collected at checkout</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="order-totals review-totals">
          <div className="order-subtotal">
            <span>Subtotal</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          {liabilityWaiver.purchaseDamageWaiver && (
            <div className="order-damage-waiver">
              <span>Damage Waiver (10%)</span>
              <span>${(cart.total * 0.1).toFixed(2)}</span>
            </div>
          )}
          {feeCalculated && (
            <div className="order-delivery">
              <span>Delivery Fee ({mileageDistance} miles from {selectedBranch ? branchLocations[selectedBranch].city : 'nearest branch'})</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {!feeCalculated && activeStep >= 2 && (
            <div className="delivery-fee-note">
              <span>Delivery fee will be calculated when you enter your address</span>
            </div>
          )}
          <div className="order-tax">
            <span>Tax (7%)</span>
            <span>${(cart.total * 0.07).toFixed(2)}</span>
          </div>
          <div className="order-total">
            <span>Total</span>
            <span>${(
              cart.total + 
              (feeCalculated ? deliveryFee : 0) + 
              (cart.total * 0.07) + 
              (liabilityWaiver.purchaseDamageWaiver ? cart.total * 0.1 : 0)
            ).toFixed(2)}</span>
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
          {selectedBranch && (
            <p>Serving Branch: {branchLocations[selectedBranch].city} ({branchLocations[selectedBranch].address}) - {mileageDistance} miles away</p>
          )}
        </div>
        
        <div className="order-summary confirmation">
          <h3>Order Summary</h3>
          <div className="order-items">
            {cart.items.map(item => (
              <div key={`${item.id}-${item.date}`} className="order-item">
                <div className="item-image">
                  {item.mainImage ? (
                    <img src={item.mainImage} alt={item.name} />
                  ) : (
                    <PlaceholderImage alt={item.name} />
                  )}
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
            {liabilityWaiver.purchaseDamageWaiver && (
              <div className="order-damage-waiver">
                <span>Damage Waiver (10%)</span>
                <span>${(cart.total * 0.1).toFixed(2)}</span>
              </div>
            )}
            {feeCalculated && (
              <div className="order-delivery">
                <span>Delivery Fee ({mileageDistance} miles from {selectedBranch ? branchLocations[selectedBranch].city : 'nearest branch'})</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="order-tax">
              <span>Tax (7%)</span>
              <span>${(cart.total * 0.07).toFixed(2)}</span>
            </div>
            <div className="order-total">
              <span>Total</span>
              <span>${(
                cart.total + 
                (feeCalculated ? deliveryFee : 0) + 
                (cart.total * 0.07) + 
                (liabilityWaiver.purchaseDamageWaiver ? cart.total * 0.1 : 0)
              ).toFixed(2)}</span>
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

  const renderNavigationButtons = () => {
    // Only show navigation buttons if not on payment step (step 4)
    if (activeStep === 4) {
      return null;
    }
    return (
      <div className="checkout-navigation">
        {activeStep > 1 && (
          <button onClick={goToPrevStep} className="prev-button" disabled={isProcessing}>
            Back
          </button>
        )}
        
        {activeStep < 5 ? (
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
    );
  };

  useEffect(() => {
    // Load saved payment method from session storage on component mount
    try {
      const savedPaymentMethod = sessionStorage.getItem('roweBros_paymentMethod');
      if (savedPaymentMethod) {
        setPaymentMethod(JSON.parse(savedPaymentMethod));
        console.log('[CheckoutPage] Loaded saved payment method from session storage:', savedPaymentMethod);
      }
    } catch (error) {
      console.error('[CheckoutPage] Error loading saved payment method:', error);
    }
  }, []);

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
                <div className="step-label">Waiver</div>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Payment</div>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 5 ? 'active' : ''}`}>
                <div className="step-number">5</div>
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
                        {item.mainImage ? (
                          <img src={item.mainImage} alt={item.name} />
                        ) : (
                          <PlaceholderImage alt={item.name} />
                        )}
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
                  {liabilityWaiver.purchaseDamageWaiver && (
                    <div className="order-damage-waiver">
                      <span>Damage Waiver (10%)</span>
                      <span>${(cart.total * 0.1).toFixed(2)}</span>
                    </div>
                  )}
                  {feeCalculated && (
                    <div className="order-delivery">
                      <span>Delivery Fee {mileageDistance > 0 ? `(${mileageDistance} miles)` : ''}</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {!feeCalculated && activeStep >= 2 && (
                    <div className="delivery-fee-note">
                      <span>Delivery fee will be calculated when you enter your address</span>
                    </div>
                  )}
                  <div className="order-tax">
                    <span>Tax (7%)</span>
                    <span>${(cart.total * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="order-total">
                    <span>Total</span>
                    <span>${(
                      cart.total + 
                      (feeCalculated ? deliveryFee : 0) + 
                      (cart.total * 0.07) + 
                      (liabilityWaiver.purchaseDamageWaiver ? cart.total * 0.1 : 0)
                    ).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {paymentError && (
              <div className="payment-error">
                <FontAwesomeIcon icon={faTimes} /> {paymentError}
              </div>
            )}
            
            {renderNavigationButtons()}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
