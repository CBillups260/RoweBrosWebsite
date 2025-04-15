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

    // Create a Stripe customer if needed
    let customer;
    if (customerInfo.email) {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.fullName,
        phone: customerInfo.phone,
        metadata: {
          deliveryAddress: deliveryInfo.address,
          deliveryInstructions: deliveryInfo.instructions,
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
        deliveryAddress: deliveryInfo.address,
        deliveryInstructions: deliveryInfo.instructions,
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
      body: JSON.stringify({ error: error.message }),
    };
  }
};
