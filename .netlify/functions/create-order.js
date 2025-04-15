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
    const { sessionId, userId, isGuest } = JSON.parse(event.body);

    // Retrieve the Stripe session to get the order details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    // Create the order in Firestore
    const orderData = {
      customerInfo: {
        email: session.customer_details.email,
        name: session.customer_details.name || 'Guest Customer',
        phone: session.customer_details.phone || '',
      },
      deliveryInfo: session.metadata.deliveryInfo ? JSON.parse(session.metadata.deliveryInfo) : {},
      items: session.line_items.data.map(item => ({
        id: item.price.product.metadata.productId || '',
        name: item.description,
        price: item.price.unit_amount / 100,
        quantity: item.quantity,
        image: item.price.product.images[0] || '',
        description: item.price.product.description || 'Fresh produce from Rowe Bros'
      })),
      subtotal: session.amount_subtotal / 100,
      deliveryFee: 50,
      tax: 0,
      total: session.amount_total / 100,
      status: 'paid',
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
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
        message: 'Order created successfully'
      })
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 