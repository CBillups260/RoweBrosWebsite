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
const createPaymentIntent = async (amount, customerInfo, deliveryInfo, cart) => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1} to create payment intent`);
      
      const metadata = {
        cartItems: JSON.stringify(cart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))),
        subtotal: cart.total,
        deliveryFee: 50,
        tax: cart.total * 0.07,
        total: cart.total + 50 + (cart.total * 0.07)
      };

      // Call our serverless function to create a payment intent
      const response = await fetch('/.netlify/functions/create-payment-intent', {
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
        // Add a longer timeout
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Payment intent creation failed (Attempt ${retryCount + 1}):`, errorText);
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to create payment intent');
        } catch (parseError) {
          // If not JSON, throw with the text
          throw new Error(`Failed to create payment intent: ${errorText.substring(0, 100)}...`);
        }
      }

      const data = await response.json();
      console.log('Payment intent created successfully:', data);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`Error creating payment intent (Attempt ${retryCount + 1}):`, error);
      
      // If it's a network error or timeout, retry
      if (
        error.name === 'TypeError' || 
        error.name === 'AbortError' || 
        error.message.includes('Failed to fetch')
      ) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // If it's not a network error, don't retry
        break;
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Failed to create payment intent after multiple attempts');
};

// Process payment with payment method
const processPayment = async (clientSecret, paymentMethod) => {
  const maxRetries = 2;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1} to process payment`);
      const stripe = await getStripe();
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (error) {
        console.error(`Payment confirmation error (Attempt ${retryCount + 1}):`, error);
        throw error;
      }

      console.log('Payment processed successfully:', paymentIntent);
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      lastError = error;
      console.error(`Error processing payment (Attempt ${retryCount + 1}):`, error);
      
      // If it's a network error, retry
      if (
        error.type === 'api_connection_error' || 
        error.code === 'resource_missing' ||
        error.message.includes('Failed to fetch')
      ) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Wait before retrying
          const delay = 2000; // 2 seconds
          console.log(`Retrying after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // If it's not a network error, don't retry
        break;
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Failed to process payment after multiple attempts');
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
