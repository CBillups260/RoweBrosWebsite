import stripeConfig from '../config/stripe-config';
import { loadStripe } from '@stripe/stripe-js';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Initialize Stripe
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
};

// Create a checkout session
export const createCheckoutSession = async (cart, customerInfo, deliveryInfo) => {
  try {
    // Format line items for Stripe
    const lineItems = cart.items.map(item => {
      return {
        price_data: {
          currency: stripeConfig.currency || 'usd',
          product_data: {
            name: item.name,
            images: item.mainImage ? [item.mainImage] : [],
            metadata: {
              id: item.id,
              date: item.date,
              time: item.time
            }
          },
          unit_amount: Math.round(extractPriceNumeric(item.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee as a separate line item
    lineItems.push({
      price_data: {
        currency: stripeConfig.currency || 'usd',
        product_data: {
          name: 'Delivery Fee',
          description: `Delivery to ${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}`,
        },
        unit_amount: 5000, // $50.00 in cents
      },
      quantity: 1,
    });

    // Create an order document in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), {
      customerInfo,
      deliveryInfo,
      items: cart.items,
      subtotal: cart.total,
      deliveryFee: 50.00,
      tax: cart.total * 0.07,
      total: cart.total + 50 + (cart.total * 0.07),
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    // Create a checkout session with Stripe
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineItems,
        customerEmail: customerInfo.email,
        orderId: orderRef.id,
        metadata: {
          orderId: orderRef.id,
        },
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderRef.id}`,
        cancel_url: `${window.location.origin}/checkout?canceled=true&order_id=${orderRef.id}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const session = await response.json();

    // Update the order with the session ID
    await updateDoc(doc(db, 'orders', orderRef.id), {
      stripeSessionId: session.id
    });

    return { sessionId: session.id, orderId: orderRef.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Helper function to extract numeric price from price string
const extractPriceNumeric = (priceString) => {
  if (!priceString) return 0;
  const match = priceString.match(/\$?(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
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
