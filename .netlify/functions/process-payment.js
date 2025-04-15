const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { paymentMethodId, cart, customerInfo, deliveryInfo, userId, isGuest } = JSON.parse(event.body);

    // Calculate total amount
    const subtotal = Math.abs(cart.total);
    const deliveryFee = 50; // $50 delivery fee
    const tax = subtotal * 0.07; // 7% tax
    const total = Math.round((subtotal + deliveryFee + tax) * 100); // Convert to cents

    // Create or retrieve Stripe Customer
    let customer;
    if (userId) {
      // Try to find existing customer
      const customers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          phone: customerInfo.phone,
          metadata: {
            userId: userId,
            isGuest: isGuest.toString()
          }
        });
      }
    } else {
      // For guest checkout, create a new customer
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        metadata: {
          isGuest: 'true'
        }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.URL}/checkout/success`,
      metadata: {
        userId: userId || 'guest',
        isGuest: isGuest.toString(),
        deliveryInfo: JSON.stringify(deliveryInfo),
        cart: JSON.stringify(cart)
      }
    });

    // Return the payment intent details
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment intent created successfully'
      })
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack
      })
    };
  }
}; 