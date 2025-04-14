# RoweBros React App Deployment Guide

## Stripe Configuration Issue

### Diagnosis
The build failed due to an import error where 'STRIPE_PUBLISHABLE_KEY' is not exported from '../config/stripe-config'.

### Solution
This issue has been fixed by updating the import statements in the stripeService.js file to use the default export from the stripe-config.js file:

1. The stripe-config.js file now exports a default object:
```javascript
const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || '',
  apiVersion: '2023-10-16',
  currency: 'usd',
};

export default stripeConfig;
```

2. The stripeService.js file now imports this default export:
```javascript
import stripeConfig from '../config/stripe-config';
```

3. And uses it like this:
```javascript
stripePromise = loadStripe(stripeConfig.publishableKey);
```

## Environment Variables

For the application to work correctly in production, make sure to set the following environment variables in your deployment platform:

- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `REACT_APP_STRIPE_SECRET_KEY`: Your Stripe secret key (only needed for server-side operations)
- `REACT_APP_FIREBASE_API_KEY`: Your Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID`: Your Firebase app ID

## Deployment Steps

1. Ensure all environment variables are set in your deployment platform
2. Run `npm run build` to create a production build
3. Deploy the contents of the `build` directory to your hosting service

## Additional Notes

- The application uses Firebase for authentication and database
- Stripe is used for payment processing
- Make sure Firestore security rules are properly configured for production use
