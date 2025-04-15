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

// Create a checkout session and redirect to Stripe
const createCheckoutSession = async (cart, customerInfo, deliveryInfo) => {
  try {
    if (!cart || !cart.items || !customerInfo || !deliveryInfo) {
      throw new Error('Missing required checkout information');
    }

    // Format line items for Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || 'Fresh produce from Rowe Bros',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee',
          description: 'Standard delivery service',
        },
        unit_amount: 5000, // $50.00 in cents
      },
      quantity: 1,
    });

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineItems,
        customerInfo,
        deliveryInfo,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout?canceled=true`,
      }),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', error);
      console.error('Raw response:', responseText);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create checkout session');
    }

    if (!responseData.sessionId) {
      throw new Error('No session ID received from server');
    }

    const stripe = await getStripe();
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: responseData.sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
  createCheckoutSession,
  getCustomerPaymentMethods,
};
