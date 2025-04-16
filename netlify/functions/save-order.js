const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Log environment variables (without exposing sensitive data)
    console.log('Firebase environment variables check:');
    console.log('FIREBASE_PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
    console.log('FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    
    // For local development, use hardcoded values if environment variables are not available
    const projectId = process.env.FIREBASE_PROJECT_ID || 'rowe-bros-website';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-rlvr1@rowe-bros-website.iam.gserviceaccount.com';
    
    // Properly parse the private key - this is a placeholder and will need to be replaced with the actual key
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // Handle escaped newlines in the environment variable
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Initialize the app with credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        // If privateKey is not available, the function will fail properly with a clear error
        privateKey: privateKey
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error; // Re-throw to ensure the function fails properly
  }
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { paymentIntentId, customerInfo, deliveryInfo, cartItems } = JSON.parse(event.body);

    console.log('Saving order with payment intent:', paymentIntentId);
    console.log('Customer info:', customerInfo);
    console.log('Delivery info:', deliveryInfo);
    console.log('Cart items:', cartItems.length);

    // Retrieve the payment intent to get all metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      console.error('Payment not successful:', paymentIntent?.status);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Payment not successful' }),
      };
    }

    // Calculate order totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50; // $50 delivery fee
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + deliveryFee + tax;

    // Create order object
    const order = {
      paymentIntentId,
      status: 'Pending',
      customer: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        phone: customerInfo.phone,
        customerId: customerInfo.uid || null
      },
      delivery: {
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zipCode: deliveryInfo.zipCode,
        date: deliveryInfo.deliveryDate,
        time: deliveryInfo.deliveryTime,
        instructions: deliveryInfo.deliveryInstructions
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        image: item.image || item.mainImage,
        date: item.date,
        time: item.time
      })),
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        status: paymentIntent.status,
        method: 'card',
        last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || 'N/A'
      },
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      },
      customerId: customerInfo.uid || null,
      total: total, 
      subtotal: subtotal, 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save order to Firestore
    console.log('Saving order to Firestore');
    const orderRef = await db.collection('orders').add(order);
    const orderId = orderRef.id;

    console.log('Order saved with ID:', orderId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        orderId,
        paymentIntentId,
        orderDetails: {
          ...order,
          id: orderId
        }
      }),
    };
  } catch (error) {
    console.error('Error saving order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack,
        message: 'Failed to save order to database'
      }),
    };
  }
};
