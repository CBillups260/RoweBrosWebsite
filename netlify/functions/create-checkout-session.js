// Netlify serverless function for creating a Stripe checkout session
const stripe = require('stripe');

// Add debug logging for environment variables
console.log('Function environment check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'missing'
});

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { cart, customerInfo, deliveryInfo } = JSON.parse(event.body);
    
    console.log('Received checkout request:', { 
      customerEmail: customerInfo.email,
      cartItems: cart.items.length,
      total: cart.total
    });

    // Initialize Stripe with the secret key
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    
    // Format line items for Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || 'Fresh produce from Rowe Bros',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a separate line item
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

    // Create metadata for the session
    const metadata = {
      customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      delivery_address: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}`,
      delivery_date: deliveryInfo.deliveryDate,
      delivery_time: deliveryInfo.deliveryTime,
    };

    // Create a checkout session with Stripe
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:8888'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/checkout?canceled=true`,
      customer_email: customerInfo.email,
      metadata,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    });

    // Return the session ID to the client
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error creating checkout session: ' + error.message 
      })
    };
  }
};
