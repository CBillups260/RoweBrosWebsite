const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
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
    
    console.log('Private key format check - starts with BEGIN:', privateKey.trim().startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log('Private key format check - ends with END:', privateKey.trim().endsWith('-----END PRIVATE KEY-----'));
    
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
      headers,
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
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack
      })
    };
  }
}; 