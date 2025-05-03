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
    console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0);
    
    // Extract environment variables with fallbacks to hardcoded values
    const projectId = process.env.FIREBASE_PROJECT_ID || 'rowebros-156a6';
    
    // Ensure client_email is a proper string value
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    if (!clientEmail) {
      clientEmail = 'firebase-adminsdk-fbsvc@rowebros-156a6.iam.gserviceaccount.com';
      console.log('Using fallback client_email:', clientEmail);
    } else {
      console.log('Using environment variable client_email with length:', clientEmail.length);
    }
    
    // Handle private key with special attention to formatting
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Private keys from environment variables often need special handling
    // Check if it's a JSON string that needs parsing
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = JSON.parse(privateKey);
    }
    
    // Handle backslash escaped newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    console.log('Private key format check - starts with -----BEGIN PRIVATE KEY-----:', privateKey.trim().startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log('Private key format check - ends with -----END PRIVATE KEY-----:', privateKey.trim().endsWith('-----END PRIVATE KEY-----'));
    
    // Final verification of credentials
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is missing or empty');
    }
    
    if (!clientEmail) {
      throw new Error('FIREBASE_CLIENT_EMAIL is missing or empty');
    }
    
    // Create an explicit service account object
    const serviceAccount = {
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey
    };
    
    // Verify all credentials
    console.log('Service account object has projectId:', !!serviceAccount.projectId);
    console.log('Service account object has clientEmail:', !!serviceAccount.clientEmail);
    console.log('Service account object has privateKey:', !!serviceAccount.privateKey);
    
    // Initialize the app with credentials
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    if (error.message.includes('Failed to parse private key')) {
      console.error('Private key parsing error. This usually means the key format is incorrect.');
      console.error('Make sure the private key includes the BEGIN and END markers and all line breaks.');
    }
    throw error;
  }
}

const db = admin.firestore();

exports.handler = async (event) => {
  // CORS headers to allow cross-origin requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
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
        headers,
        body: JSON.stringify({ error: 'Payment not successful' }),
      };
    }

    // Calculate order totals
    console.log('Calculating order totals from cart items:', JSON.stringify(cartItems.map(item => ({ 
      id: item.id,
      name: item.name,
      price: item.price,
      priceNumeric: item.priceNumeric,
      quantity: item.quantity
    }))));
    
    // Calculate subtotal with careful handling of price values
    const subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' 
        ? item.price 
        : (item.priceNumeric || parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0);
      
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      console.log(`Item: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    // Extract fee from delivery info if available, otherwise use default
    const deliveryFee = deliveryInfo.deliveryFee 
      ? parseFloat(deliveryInfo.deliveryFee) 
      : 50; // Default $50 delivery fee
    
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + deliveryFee + tax;
    
    console.log('Order totals calculated:', {
      subtotal,
      deliveryFee, 
      tax,
      total
    });

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
        price: typeof item.price === 'number' 
          ? item.price 
          : (item.priceNumeric || parseFloat(item.price?.toString().replace(/[^0-9.]/g, '')) || 0),
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
      headers,
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
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack,
        message: 'Failed to save order to database'
      }),
    };
  }
};
