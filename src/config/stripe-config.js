// Stripe configuration
// IMPORTANT: In a production environment, these keys should be stored in environment variables
// and not committed to source control. This is only for development purposes.

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RD23eR969oyjXsRdFcsZ8jaIX9fm9pCi98yZ2j2YjOdK9u2f6yN1CJtn9G2P1VeEf4NlWux84QYkYsqnhd4I2Tq00HO2s1A1q';

// NOTE: The secret key should only be used on the server-side and never exposed to the client
// This is for backend use only (Firebase Cloud Functions or server)
export const STRIPE_SECRET_KEY = 'sk_test_51RD23eR969oyjXsRFjXI9XF2zw9tyyMJ0I76DgrY1ou730xT8EvEJiH7WT7IrzgpCJl2SMsQyH23IhelENJ3hdFK00H3JTidKO';

// Stripe API version
export const STRIPE_API_VERSION = '2023-10-16';

// Currency
export const CURRENCY = 'usd';
