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
    const { paymentIntentId, userId, customerInfo, cart, deliveryInfo } = JSON.parse(event.body);

    // --- Data Validation and Sanitization ---
    if (!paymentIntentId || !customerInfo || !cart || !deliveryInfo) {
      throw new Error('Missing required data in request body');
    }
    if (!cart.items || !Array.isArray(cart.items) || typeof cart.total !== 'number') {
       throw new Error('Invalid cart structure');
    }
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
       throw new Error('Invalid customerInfo structure');
    }
    if (!customerInfo.address.line1 || !customerInfo.address.city || !customerInfo.address.state || !customerInfo.address.postal_code || !customerInfo.address.country) {
      throw new Error('Invalid customerInfo address structure');
    }

    // Ensure all monetary values are valid numbers and in dollars
    const subtotal = Math.abs(Number(cart.total) || 0);
    const deliveryFee = 50.00; // Use float for consistency
    const taxRate = 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    // --- Create order data for Firestore ---
    const orderData = {
      userId: userId || null,
      customerInfo: {
        name: `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim(),
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        address: {
          line1: customerInfo.address.line1 || '',
          line2: customerInfo.address.line2 || '',
          city: customerInfo.address.city || '',
          state: customerInfo.address.state || '',
          postal_code: customerInfo.address.postal_code || '',
          country: customerInfo.address.country || ''
        }
      },
      items: cart.items.map(item => ({
        productId: item.id || '',
        name: item.name || 'Unknown Item',
        price: Math.abs(Number(item.price) || 0), // Ensure price is a positive number
        quantity: Math.max(1, Number(item.quantity) || 1), // Ensure quantity is at least 1
        image: item.image || ''
      })),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: deliveryFee,
      total: Number(total.toFixed(2)), // Ensure 2 decimal places
      status: 'pending', // Default status
      paymentStatus: 'paid', // Assume payment succeeded if this function is called
      paymentIntentId: paymentIntentId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log("Attempting to create order with data:", JSON.stringify(orderData, null, 2));

    // Create order in Firestore
    const orderRef = await admin.firestore().collection('orders').add(orderData);
    console.log("Order created successfully with ID:", orderRef.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderRef.id,
        message: 'Order created successfully'
      })
    };
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.stack);
    // Log the received body to help debug
    console.error('Received event body:', event.body);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: `Error creating order: ${error.message}`,
        details: error.stack
      })
    };
  }
}; 