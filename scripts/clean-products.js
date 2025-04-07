const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with service account
try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  // Initialize the app
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  
  const db = getFirestore();
  
  // Function to clean up products
  async function cleanupProducts() {
    console.log('Cleaning up products...');
    
    try {
      // Get all products
      const productsSnapshot = await db.collection('products').get();
      
      // Keep track of deleted products
      let deletedCount = 0;
      
      // Loop through products and delete those that are not bounce houses
      const deletePromises = [];
      
      productsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Keep only products that are bounce houses (check for category or name patterns)
        const isBounceHouse = 
          data.name?.includes('Combo') || 
          data.name?.includes('Bounce') || 
          data.name?.includes('Slide') || 
          data.name?.includes('Obstacle') || 
          data.name?.includes('Castle') || 
          data.name?.includes('Dinosaur') || 
          data.name?.includes('Rainbow') || 
          data.name?.includes('Tropical') || 
          data.name?.includes('Jelly Bean') || 
          data.name?.includes('Sports Arena') || 
          data.name?.includes('Sunrise');
        
        // If it's not a bounce house, delete it
        if (!isBounceHouse) {
          deletePromises.push(doc.ref.delete());
          deletedCount++;
          console.log(`Deleting product: ${data.name}`);
        } else {
          console.log(`Keeping bounce house product: ${data.name}`);
        }
      });
      
      // Execute all delete operations
      await Promise.all(deletePromises);
      
      console.log(`Deleted ${deletedCount} unrelated products`);
      console.log('Product cleanup completed successfully!');
    } catch (error) {
      console.error('Error cleaning up products:', error);
    }
  }
  
  // Function to clean up categories
  async function cleanupCategories() {
    console.log('Cleaning up categories...');
    
    try {
      // Get all categories
      const categoriesSnapshot = await db.collection('categories').get();
      
      // Keep track of deleted categories
      let deletedCount = 0;
      
      // Loop through categories and delete those that are not related to bounce houses
      const deletePromises = [];
      
      categoriesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Keep only categories related to bounce houses
        const isRelevantCategory = 
          data.name === 'Combo' || 
          data.name === 'Slide' || 
          data.name === 'Water' || 
          data.name === 'Obstacle';
        
        // If it's not a relevant category, delete it
        if (!isRelevantCategory) {
          deletePromises.push(doc.ref.delete());
          deletedCount++;
          console.log(`Deleting category: ${data.name}`);
        } else {
          console.log(`Keeping category: ${data.name}`);
        }
      });
      
      // Execute all delete operations
      await Promise.all(deletePromises);
      
      console.log(`Deleted ${deletedCount} unrelated categories`);
      console.log('Category cleanup completed successfully!');
    } catch (error) {
      console.error('Error cleaning up categories:', error);
    }
  }
  
  // Main function to run the cleanup process
  async function cleanupDatabase() {
    try {
      await cleanupCategories();
      await cleanupProducts();
      
      console.log('Database cleanup completed successfully!');
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  }
  
  // Run the cleanup process
  cleanupDatabase()
    .then(() => {
      console.log('Cleanup script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup script failed:', error);
      process.exit(1);
    });
  
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Make sure you have created a serviceAccountKey.json file in the project root.');
  process.exit(1);
}
