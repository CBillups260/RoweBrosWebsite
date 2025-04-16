const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount, currency = 'usd', customerInfo, deliveryInfo, metadata = {} } = JSON.parse(event.body);

    console.log('Creating payment intent with:', { amount, customerInfo, deliveryInfo });

    // Safely handle address structure
    let addressLine1 = '';
    if (deliveryInfo) {
      if (typeof deliveryInfo.address === 'object' && deliveryInfo.address !== null) {
        // If address is an object with line1 property
        addressLine1 = deliveryInfo.address.line1 || '';
      } else {
        // If address is a string or undefined
        addressLine1 = deliveryInfo.address || '';
      }
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      // Optional: automatically save customer payment method for future use
      setup_future_usage: 'off_session',
      metadata: {
        ...metadata,
        customerName: customerInfo?.firstName && customerInfo?.lastName 
          ? `${customerInfo.firstName} ${customerInfo.lastName}` 
          : customerInfo?.fullName || '',
        customerEmail: customerInfo?.email || '',
        customerPhone: customerInfo?.phone || '',
        deliveryAddress: JSON.stringify({
          line1: addressLine1,
          city: deliveryInfo?.city || '',
          state: deliveryInfo?.state || '',
          postal_code: deliveryInfo?.zipCode || '',
        }),
        deliveryDate: deliveryInfo?.deliveryDate || '',
        deliveryTime: deliveryInfo?.deliveryTime || '',
        deliveryInstructions: deliveryInfo?.deliveryInstructions || '',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
    };
  }
};
