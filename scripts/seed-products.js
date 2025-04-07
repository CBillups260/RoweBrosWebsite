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
  
  // Sample categories data
  const categories = [
    {
      name: 'Tents',
      description: 'Camping tents for outdoor adventures',
      icon: 'tent',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Chairs',
      description: 'Comfortable seating for outdoor events',
      icon: 'chair',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Tables',
      description: 'Folding tables for events and gatherings',
      icon: 'table',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Lighting',
      description: 'Lighting solutions for events and parties',
      icon: 'lightbulb',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Sound Equipment',
      description: 'Professional sound systems for events',
      icon: 'music',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // Function to add categories
  async function addCategories() {
    console.log('Adding categories...');
    const categoryIds = {};
    
    for (const category of categories) {
      try {
        const docRef = await db.collection('categories').add(category);
        console.log(`Added category: ${category.name} with ID: ${docRef.id}`);
        categoryIds[category.name] = docRef.id;
      } catch (error) {
        console.error(`Error adding category ${category.name}:`, error);
      }
    }
    
    return categoryIds;
  }
  
  // Sample products data (will be populated with category IDs)
  function getProductsData(categoryIds) {
    return [
      {
        name: '10x10 Canopy Tent',
        description: 'Perfect for outdoor events, provides shade and protection from elements.',
        price: 75.99,
        stock: 15,
        categoryId: categoryIds['Tents'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/canopy-tent.jpg'
          }
        ],
        features: ['Easy setup', 'Water resistant', 'UV protection'],
        dimensions: '10ft x 10ft x 8ft',
        weight: '45 lbs',
        rentalOptions: [
          { duration: 'Day', price: 75.99 },
          { duration: 'Weekend', price: 129.99 },
          { duration: 'Week', price: 299.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Folding Chair',
        description: 'Comfortable folding chair for events and gatherings.',
        price: 2.99,
        stock: 200,
        categoryId: categoryIds['Chairs'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/folding-chair.jpg'
          }
        ],
        features: ['Lightweight', 'Easy to transport', 'Durable'],
        dimensions: '18in x 20in x 32in',
        weight: '5 lbs',
        rentalOptions: [
          { duration: 'Day', price: 2.99 },
          { duration: 'Weekend', price: 4.99 },
          { duration: 'Week', price: 9.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '6ft Banquet Table',
        description: 'Sturdy rectangular table for events, perfect for dining or displays.',
        price: 8.99,
        stock: 50,
        categoryId: categoryIds['Tables'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1565791380713-1756b9a05343?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
            path: 'products/banquet-table.jpg'
          }
        ],
        features: ['Folds in half for easy transport', 'Sturdy construction', 'Stain-resistant surface'],
        dimensions: '72in x 30in x 29in',
        weight: '30 lbs',
        rentalOptions: [
          { duration: 'Day', price: 8.99 },
          { duration: 'Weekend', price: 14.99 },
          { duration: 'Week', price: 29.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'LED String Lights',
        description: 'Beautiful string lights to create ambiance at any event.',
        price: 15.99,
        stock: 30,
        categoryId: categoryIds['Lighting'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1547393947-0a6f3cded15e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/string-lights.jpg'
          }
        ],
        features: ['100 warm white LEDs', 'Indoor/outdoor use', '8 lighting modes'],
        dimensions: '33ft string length',
        weight: '1.5 lbs',
        rentalOptions: [
          { duration: 'Day', price: 15.99 },
          { duration: 'Weekend', price: 24.99 },
          { duration: 'Week', price: 49.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Portable PA System',
        description: 'High-quality sound system for speeches, music, and announcements.',
        price: 89.99,
        stock: 10,
        categoryId: categoryIds['Sound Equipment'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1520170350707-b2da59970118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/pa-system.jpg'
          }
        ],
        features: ['Bluetooth connectivity', 'Wireless microphone included', 'Battery-powered option'],
        dimensions: '12in x 10in x 20in',
        weight: '15 lbs',
        rentalOptions: [
          { duration: 'Day', price: 89.99 },
          { duration: 'Weekend', price: 149.99 },
          { duration: 'Week', price: 299.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '20x20 Event Tent',
        description: 'Large event tent perfect for weddings, corporate events, and large gatherings.',
        price: 299.99,
        stock: 5,
        categoryId: categoryIds['Tents'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1609151376730-f246ec0b99e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
            path: 'products/event-tent.jpg'
          }
        ],
        features: ['Professional setup included', 'Sidewalls available', 'Weather resistant'],
        dimensions: '20ft x 20ft x 12ft',
        weight: '200 lbs',
        rentalOptions: [
          { duration: 'Day', price: 299.99 },
          { duration: 'Weekend', price: 499.99 },
          { duration: 'Week', price: 999.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chiavari Chair',
        description: 'Elegant chairs perfect for weddings and upscale events.',
        price: 7.99,
        stock: 100,
        categoryId: categoryIds['Chairs'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/chiavari-chair.jpg'
          }
        ],
        features: ['Classic design', 'Cushioned seat', 'Multiple color options'],
        dimensions: '16in x 16in x 36in',
        weight: '8 lbs',
        rentalOptions: [
          { duration: 'Day', price: 7.99 },
          { duration: 'Weekend', price: 12.99 },
          { duration: 'Week', price: 24.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Round Cocktail Table',
        description: 'Elegant high-top tables perfect for cocktail hours and networking events.',
        price: 12.99,
        stock: 40,
        categoryId: categoryIds['Tables'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1529417305485-480f579e7578?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
            path: 'products/cocktail-table.jpg'
          }
        ],
        features: ['Adjustable height', 'Includes tablecloth', 'Sturdy construction'],
        dimensions: '30in diameter x 42in height',
        weight: '20 lbs',
        rentalOptions: [
          { duration: 'Day', price: 12.99 },
          { duration: 'Weekend', price: 19.99 },
          { duration: 'Week', price: 39.99 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  // Function to add products
  async function addProducts(categoryIds) {
    console.log('Adding products...');
    const products = getProductsData(categoryIds);
    
    for (const product of products) {
      try {
        const docRef = await db.collection('products').add(product);
        console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`Error adding product ${product.name}:`, error);
      }
    }
  }
  
  // Main function to run the seed process
  async function seedDatabase() {
    try {
      // Check if categories already exist
      const categoriesSnapshot = await db.collection('categories').get();
      if (!categoriesSnapshot.empty) {
        console.log('Categories already exist. Skipping category creation.');
        
        // Get existing category IDs
        const categoryIds = {};
        categoriesSnapshot.forEach(doc => {
          categoryIds[doc.data().name] = doc.id;
        });
        
        // Check if products already exist
        const productsSnapshot = await db.collection('products').get();
        if (!productsSnapshot.empty) {
          console.log('Products already exist. Skipping product creation.');
        } else {
          await addProducts(categoryIds);
        }
        
        return;
      }
      
      // Add categories and then products
      const categoryIds = await addCategories();
      await addProducts(categoryIds);
      
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
  
  // Run the seed process
  seedDatabase()
    .then(() => {
      console.log('Seed script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
  
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Make sure you have created a serviceAccountKey.json file in the project root.');
  process.exit(1);
}
