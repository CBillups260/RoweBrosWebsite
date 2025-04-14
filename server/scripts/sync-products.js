// Script to sync products from Firebase to Stripe
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RD23eR969oyjXsRFjXI9XF2zw9tyyMJ0I76DgrY1ou730xT8EvEJiH7WT7IrzgpCJl2SMsQyH23IhelENJ3hdFK00H3JTidKO');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mr-meatz-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function syncProducts() {
  try {
    console.log('Starting product sync...');
    
    // Get all products from Firebase
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${products.length} products in Firebase`);
    
    // Sync each product to Stripe
    const results = [];
    
    for (const product of products) {
      console.log(`Processing product: ${product.name}`);
      
      // Check if product already exists in Stripe by listing products and filtering
      let stripeProducts;
      try {
        stripeProducts = await stripe.products.list({
          limit: 100
        });
      } catch (error) {
        console.error('Error listing products:', error);
        throw error;
      }
      
      // Find product with matching Firebase ID in metadata
      const existingProduct = stripeProducts.data.find(p => 
        p.metadata && p.metadata.firebaseId === product.id
      );
      
      let stripeProduct;
      
      if (existingProduct) {
        // Update existing product
        console.log(`Updating existing product in Stripe: ${existingProduct.id}`);
        
        try {
          stripeProduct = await stripe.products.update(
            existingProduct.id,
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
        } catch (error) {
          console.error(`Error updating product ${product.name}:`, error);
          continue;
        }
        
        // Get existing prices for this product
        let existingPrices;
        try {
          existingPrices = await stripe.prices.list({
            product: stripeProduct.id,
            active: true,
            limit: 1
          });
        } catch (error) {
          console.error(`Error listing prices for product ${product.name}:`, error);
          continue;
        }
        
        // If price exists and amount is different, deactivate old price and create new one
        const newPriceAmount = Math.round(parseFloat(product.price) * 100); // Convert to cents
        
        if (existingPrices.data.length > 0 && existingPrices.data[0].unit_amount !== newPriceAmount) {
          console.log(`Price changed, creating new price for product: ${product.name}`);
          
          try {
            // Deactivate old price
            await stripe.prices.update(existingPrices.data[0].id, { active: false });
            
            // Create new price
            const price = await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: newPriceAmount,
              currency: 'usd',
              metadata: {
                firebaseId: product.id
              }
            });
            
            results.push({
              productId: product.id,
              stripeProductId: stripeProduct.id,
              stripePriceId: price.id,
              status: 'updated-with-new-price'
            });
          } catch (error) {
            console.error(`Error updating price for product ${product.name}:`, error);
            continue;
          }
        } else {
          results.push({
            productId: product.id,
            stripeProductId: stripeProduct.id,
            stripePriceId: existingPrices.data.length > 0 ? existingPrices.data[0].id : null,
            status: 'updated'
          });
        }
      } else {
        // Create new product
        console.log(`Creating new product in Stripe: ${product.name}`);
        
        try {
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
          
          // Update Firebase product with Stripe IDs
          await db.collection('products').doc(product.id).update({
            stripeProductId: stripeProduct.id,
            stripePriceId: price.id
          });
        } catch (error) {
          console.error(`Error creating product ${product.name}:`, error);
          continue;
        }
      }
    }
    
    console.log('Product sync completed successfully!');
    console.log('Results:', JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

// Run the sync
syncProducts()
  .then(() => {
    console.log('Sync completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
