// Stripe configuration
// IMPORTANT: In a production environment, these keys should be stored in environment variables
// and not committed to source control. This is only for development purposes.

// Stripe Configuration
const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || '',
  apiVersion: '2023-10-16',
  currency: 'usd',
};

export default stripeConfig;
