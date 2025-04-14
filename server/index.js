const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// API Routes
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, customerEmail, metadata, success_url, cancel_url } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url,
      cancel_url,
      customer_email: customerEmail,
      metadata,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free delivery',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync-products', async (req, res) => {
  try {
    const { products } = req.body;
    const results = [];

    for (const product of products) {
      // Check if product already exists in Stripe
      const existingProducts = await stripe.products.list({
        limit: 1,
        active: true,
        metadata: { firebaseId: product.id }
      });

      let stripeProduct;

      if (existingProducts.data.length > 0) {
        // Update existing product
        stripeProduct = await stripe.products.update(
          existingProducts.data[0].id,
          {
            name: product.name,
            description: product.description || '',
            images: product.images ? product.images.map(img => img.url) : [],
            metadata: {
              firebaseId: product.id,
              category: product.categoryId || '',
            },
          }
        );

        // Update or create price
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            firebaseId: product.id
          }
        });

        results.push({
          productId: product.id,
          stripeProductId: stripeProduct.id,
          stripePriceId: price.id,
          status: 'updated'
        });
      } else {
        // Create new product
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description || '',
          images: product.images ? product.images.map(img => img.url) : [],
          metadata: {
            firebaseId: product.id,
            category: product.categoryId || '',
          },
        });

        // Create price
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            firebaseId: product.id
          }
        });

        results.push({
          productId: product.id,
          stripeProductId: stripeProduct.id,
          stripePriceId: price.id,
          status: 'created'
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-payment', async (req, res) => {
  try {
    const { paymentMethodId, amount, orderId } = req.body;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderId
      }
    });

    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json(paymentMethods.data);
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update order status in your database
      console.log('Checkout completed:', session);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      console.log('Payment succeeded:', paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
