import stripeConfig from '../config/stripe-config';
import { loadStripe } from '@stripe/stripe-js';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

// Initialize Stripe
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
};

// Helper function to extract numeric price value
export const extractPriceNumeric = (priceString) => {
  if (!priceString) return 0;
  // Remove any non-numeric characters except for decimal point
  const numericString = priceString.toString().replace(/[^0-9.]/g, '');
  // Parse as float and ensure it's positive
  return Math.abs(parseFloat(numericString) || 0);
};

// Create a checkout session
export const createCheckoutSession = async (cart, customerInfo, deliveryInfo) => {
  try {
    console.log('Creating checkout session with:', {
      cartItems: cart.items.length,
      customerEmail: customerInfo.email
    });

    // Create order in Firebase first
    const orderData = {
      customerInfo: {
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone
      },
      deliveryInfo: {
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zipCode: deliveryInfo.zipCode,
        deliveryDate: deliveryInfo.deliveryDate,
        deliveryTime: deliveryInfo.deliveryTime,
        specialInstructions: deliveryInfo.specialInstructions
      },
      items: cart.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description || 'Fresh produce from Rowe Bros' // Add default description if none exists
      })),
      subtotal: cart.total,
      deliveryFee: 50, // $50 delivery fee
      tax: 0, // Calculate tax if needed
      total: cart.total + 50,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: auth.currentUser?.uid || null,
      isGuest: !auth.currentUser,
    };

    // Create an order document in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData);

    // Create a checkout session with Stripe using Netlify function
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart,
        customerInfo,
        deliveryInfo,
        orderId: orderRef.id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const session = await response.json();
    
    // Update the order with the session ID
    await updateDoc(doc(db, 'orders', orderRef.id), {
      stripeSessionId: session.sessionId,
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Sync products from Firebase to Stripe
export const syncProductsToStripe = async (products) => {
  try {
    const response = await fetch('/api/sync-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync products with Stripe');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing products to Stripe:', error);
    throw error;
  }
};

// Process payment with Stripe Elements
export const processPayment = async (paymentMethod, amount, orderId) => {
  try {
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        amount: Math.round(amount * 100), // Convert to cents
        orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment processing failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Retrieve a customer's payment methods
export const getCustomerPaymentMethods = async (customerId) => {
  try {
    const response = await fetch(`/api/payment-methods?customerId=${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve payment methods');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    throw error;
  }
};
