const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { lineItems, customerInfo, deliveryInfo, successUrl, cancelUrl } = JSON.parse(event.body);

    // Log the received data for debugging
    console.log('Received data:', {
      lineItemsCount: lineItems ? lineItems.length : 0,
      customerInfo: customerInfo,
      deliveryInfo: deliveryInfo,
      hasDeliveryAddress: deliveryInfo && deliveryInfo.address,
    });

    // Safely handle address fields
    const address = deliveryInfo && deliveryInfo.address ? {
      line1: deliveryInfo.address.line1 || '',
      line2: deliveryInfo.address.line2 || '',
      city: deliveryInfo.address.city || '',
      state: deliveryInfo.address.state || '',
      postal_code: deliveryInfo.address.postal_code || '',
      country: deliveryInfo.address.country || 'US'
    } : {};

    // Create a Stripe customer if needed
    let customer;
    if (customerInfo.email) {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.fullName,
        phone: customerInfo.phone,
        address,
        metadata: {
          deliveryAddress: JSON.stringify(address),
          deliveryInstructions: deliveryInfo.instructions || '',
        },
      });
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customer ? customer.id : undefined,
      metadata: {
        customerName: customerInfo.fullName,
        customerEmail: customerInfo.email,
        deliveryAddress: JSON.stringify(address),
        deliveryInstructions: deliveryInfo.instructions || '',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.details || 'Check server logs for more info'
      }),
    };
  }
};
