const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
        deliveryInfo: JSON.stringify(deliveryInfo)
      }
    });

    // Create the order in Firestore
    const orderData = {
      customerInfo: {
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        stripeCustomerId: customer.id
      },
      deliveryInfo: deliveryInfo,
      items: cart.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.priceNumeric,
        quantity: item.quantity,
        image: item.mainImage || item.image || '',
        description: item.description || 'Fresh produce from Rowe Bros'
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      total: total / 100,
      status: 'paid',
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      isGuest: isGuest
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        orderId: orderRef.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment processed successfully'
      })
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 