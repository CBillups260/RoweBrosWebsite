// Netlify serverless function for creating a Stripe checkout session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add debug logging for environment variables
console.log('Function environment check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'missing',
  nodeEnv: process.env.NODE_ENV,
  url: process.env.URL
});

exports.handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { lineItems, customerInfo, deliveryInfo, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!lineItems || !customerInfo || !deliveryInfo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: {
        line1: customerInfo.address.line1,
        line2: customerInfo.address.line2,
        city: customerInfo.address.city,
        state: customerInfo.address.state,
        postal_code: customerInfo.address.postal_code,
        country: customerInfo.address.country,
      },
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        customerId: customer.id,
        deliveryInstructions: deliveryInfo.instructions || '',
      },
    });

    // Return the session ID
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        customerId: customer.id
      }),
    };
  } catch (error) {
    // Log the error
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
    };
  }
};
