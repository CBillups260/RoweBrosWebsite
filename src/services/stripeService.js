import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Helper function to extract numeric price from price string
const extractPriceNumeric = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const numeric = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(numeric) || 0;
  }
  return 0;
};

// Calculate total amount in cents from cart items
const calculateTotalAmount = (cart) => {
  if (!cart || !cart.items || !cart.items.length) return 0;
  
  // Calculate subtotal from cart items
  const subtotal = cart.items.reduce((total, item) => {
    const price = typeof item.price === 'number' 
      ? item.price 
      : extractPriceNumeric(item.price);
    return total + (price * item.quantity);
  }, 0);
  
  // Add delivery fee ($50)
  const deliveryFee = 50;
  
  // Add tax (7%)
  const tax = subtotal * 0.07;
  
  // Calculate final total
  const total = subtotal + deliveryFee + tax;
  
  // Convert to cents for Stripe
  return Math.round(total * 100);
};

// Create a payment intent and return client secret
const createPaymentIntent = async (cart, customerInfo, deliveryInfo) => {
  try {
    if (!cart || !cart.items) {
      throw new Error('Missing cart information');
    }

    // Calculate total amount in cents
    const amount = calculateTotalAmount(cart);
    
    if (amount <= 0) {
      throw new Error('Invalid cart total');
    }
    
    console.log('Creating payment intent with amount:', amount);

    // Create metadata with cart items
    const metadata = {
      cartItems: JSON.stringify(cart.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : extractPriceNumeric(item.price)
      }))),
      subtotal: cart.total,
      deliveryFee: 50,
      tax: cart.total * 0.07,
      total: cart.total + 50 + (cart.total * 0.07)
    };

    // Call our serverless function to create a payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'usd',
        customerInfo,
        deliveryInfo,
        metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment intent creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Process payment with payment method
const processPayment = async (clientSecret, paymentMethod) => {
  try {
    const stripe = await getStripe();
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Get customer's payment methods
const getCustomerPaymentMethods = async (customerId) => {
  try {
    const response = await fetch('/.netlify/functions/get-payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get payment methods');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

export {
  getStripe,
  createPaymentIntent,
  processPayment,
  getCustomerPaymentMethods,
  calculateTotalAmount,
  extractPriceNumeric
};
