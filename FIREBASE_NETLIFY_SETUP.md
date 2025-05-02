# Setting Up Firebase Environment Variables in Netlify

This guide will help you set up the necessary Firebase credentials in your Netlify dashboard to fix the checkout process.

## Required Environment Variables

You need to set the following environment variables in your Netlify dashboard:

1. `FIREBASE_PROJECT_ID`: Your Firebase project ID (`rowebros-156a6`)
2. `FIREBASE_CLIENT_EMAIL`: The service account email (`firebase-adminsdk-fbsvc@rowebros-156a6.iam.gserviceaccount.com`)
3. `FIREBASE_PRIVATE_KEY`: The private key for the Firebase service account (from your Firebase Admin SDK)
4. `STRIPE_SECRET_KEY`: Your Stripe secret key for processing payments

## Steps to Set Up Netlify Environment Variables

1. Log in to your Netlify dashboard
2. Select your website from the dashboard
3. Go to **Site settings** (in the top navigation)
4. Click on **Environment variables** in the left sidebar
5. Add the following environment variables:

### FIREBASE_PROJECT_ID
- Key: `FIREBASE_PROJECT_ID` 
- Value: `rowebros-156a6`

### FIREBASE_CLIENT_EMAIL
- Key: `FIREBASE_CLIENT_EMAIL`
- Value: `firebase-adminsdk-fbsvc@rowebros-156a6.iam.gserviceaccount.com`

### FIREBASE_PRIVATE_KEY
- Key: `FIREBASE_PRIVATE_KEY`
- Value: The private key from your Firebase service account

To get your Firebase private key:
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`rowebros-156a6`)
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Open the JSON file and copy the `private_key` value (including the quotes and newlines)

**IMPORTANT:** Make sure to include the entire key exactly as it appears, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts.

### STRIPE_SECRET_KEY
- Key: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key (starting with `sk_test_` for test mode or `sk_live_` for production)

## After Setting Variables

After setting these environment variables:

1. Trigger a new deployment by clicking on **Deploys** in the top navigation and then **Trigger deploy > Deploy site**
2. Wait for the deployment to complete
3. Test the checkout process again

## Troubleshooting

If you still encounter issues:

1. Check the Netlify function logs in the Netlify dashboard under **Functions**
2. Verify that all environment variables are correctly set with the exact values
3. Make sure the Firebase service account has the necessary permissions in Firebase
4. Ensure the Stripe API key is valid and has the correct permissions 