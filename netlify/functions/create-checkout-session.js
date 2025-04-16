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
    });

    // SIMPLIFIED APPROACH: Create a safe address object regardless of input format
    const address = {
      line1: deliveryInfo?.address?.line1 || deliveryInfo?.address || '',
      line2: deliveryInfo?.address?.line2 || '',
      city: deliveryInfo?.address?.city || deliveryInfo?.city || '',
      state: deliveryInfo?.address?.state || deliveryInfo?.state || '',
      postal_code: deliveryInfo?.address?.postal_code || deliveryInfo?.zipCode || '',
      country: deliveryInfo?.address?.country || 'US'
    };

    console.log('Using address:', address);

    // Create a Stripe customer if needed
    let customer;
    if (customerInfo?.email) {
      // Create a full name from firstName and lastName
      const fullName = customerInfo.fullName || 
                     `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() || 
                     'Guest Customer';
      
      console.log('Creating customer with name:', fullName);
      
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: fullName,
        phone: customerInfo.phone || '',
        address,
        metadata: {
          deliveryAddress: JSON.stringify(address),
          deliveryInstructions: deliveryInfo?.instructions || deliveryInfo?.deliveryInstructions || '',
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
        customerName: customerInfo?.fullName || 
                   `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`.trim() || '',
        customerEmail: customerInfo?.email || '',
        deliveryAddress: JSON.stringify(address),
        deliveryInstructions: deliveryInfo?.instructions || deliveryInfo?.deliveryInstructions || '',
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
