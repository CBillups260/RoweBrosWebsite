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
      name: 'Combo',
      description: 'Bounce houses with slides and other features',
      icon: 'bounce-house',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Slide',
      description: 'Inflatable slides for events',
      icon: 'slide',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Water',
      description: 'Water slides and water-based inflatables',
      icon: 'water',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Obstacle',
      description: 'Obstacle courses and interactive inflatables',
      icon: 'obstacle',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // Function to add categories
  async function addCategories() {
    console.log('Adding bounce house categories...');
    const categoryIds = {};
    
    for (const category of categories) {
      try {
        // Check if category already exists
        const categorySnapshot = await db.collection('categories')
          .where('name', '==', category.name)
          .get();
        
        if (!categorySnapshot.empty) {
          console.log(`Category ${category.name} already exists, using existing ID`);
          categoryIds[category.name] = categorySnapshot.docs[0].id;
        } else {
          const docRef = await db.collection('categories').add(category);
          console.log(`Added category: ${category.name} with ID: ${docRef.id}`);
          categoryIds[category.name] = docRef.id;
        }
      } catch (error) {
        console.error(`Error adding category ${category.name}:`, error);
      }
    }
    
    return categoryIds;
  }
  
  // Actual products from the site
  function getBounceHouseData(categoryIds) {
    return [
      // Elkhart Location
      {
        name: 'Blue Marble Combo',
        description: 'Exciting combo bounce house with slide and basketball hoop.',
        price: 175.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/blue-marble-combo.jpg'
          }
        ],
        features: ['Basketball hoop', 'Slide', 'Bounce area'],
        dimensions: '15\' x 15\' x 15\'',
        ageRange: 'Ages 3-12',
        capacity: 'Up to 8 kids',
        location: 'Elkhart',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 175.00 },
          { duration: 'Weekend', price: 300.00 },
          { duration: 'Week', price: 700.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Carnival Combo',
        description: 'Colorful carnival-themed combo with bounce area and slide.',
        price: 185.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/carnival-combo.jpg'
          }
        ],
        features: ['Carnival theme', 'Slide', 'Large bounce area'],
        dimensions: '18\' x 15\' x 15\'',
        ageRange: 'Ages 3-12',
        capacity: 'Up to 10 kids',
        location: 'Elkhart',
        popular: false,
        rentalOptions: [
          { duration: 'Day', price: 185.00 },
          { duration: 'Weekend', price: 315.00 },
          { duration: 'Week', price: 740.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tropical XL Dual Lane Combo',
        description: 'Tropical paradise with dual racing lanes and large bounce area.',
        price: 225.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/tropical-xl-dual-lane-combo.jpg'
          }
        ],
        features: ['Dual racing lanes', 'Tropical theme', 'Extra large bounce area'],
        dimensions: '22\' x 20\' x 18\'',
        ageRange: 'Ages 5-15',
        capacity: 'Up to 12 kids',
        location: 'Elkhart',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 225.00 },
          { duration: 'Weekend', price: 380.00 },
          { duration: 'Week', price: 900.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jelly Bean Dual Lane Combo',
        description: 'Colorful jelly bean themed dual lane slide and bounce combo.',
        price: 215.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/jelly-bean-dual-lane-combo.jpg'
          }
        ],
        features: ['Dual lanes', 'Colorful design', 'Bounce area'],
        dimensions: '20\' x 18\' x 16\'',
        ageRange: 'Ages 4-12',
        capacity: 'Up to 10 kids',
        location: 'Elkhart',
        popular: false,
        rentalOptions: [
          { duration: 'Day', price: 215.00 },
          { duration: 'Weekend', price: 365.00 },
          { duration: 'Week', price: 860.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rainbow Dual Lane Combo',
        description: 'Vibrant rainbow-themed combo with dual racing slides.',
        price: 220.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/rainbow-dual-lane-combo.jpg'
          }
        ],
        features: ['Rainbow theme', 'Dual racing slides', 'Large bounce area'],
        dimensions: '21\' x 18\' x 17\'',
        ageRange: 'Ages 4-14',
        capacity: 'Up to 12 kids',
        location: 'Elkhart',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 220.00 },
          { duration: 'Weekend', price: 375.00 },
          { duration: 'Week', price: 880.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Angola Location
      {
        name: 'Sunrise Waterslide',
        description: 'Refreshing water slide with pool at the bottom for hot summer days.',
        price: 195.00,
        stock: 1,
        categoryId: categoryIds['Water'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/sunrise-waterslide.jpg'
          }
        ],
        features: ['Water slide', 'Pool at bottom', 'Refreshing for summer'],
        dimensions: '25\' x 12\' x 18\'',
        ageRange: 'Ages 5-15',
        capacity: 'Up to 8 kids',
        location: 'Angola',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 195.00 },
          { duration: 'Weekend', price: 330.00 },
          { duration: 'Week', price: 780.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dinosaur XL Dual Lane Combo',
        description: 'Prehistoric adventure with dinosaur theme and dual slides.',
        price: 230.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/dinosaur-xl-dual-lane-combo.jpg'
          }
        ],
        features: ['Dinosaur theme', 'Dual slides', 'Extra large size'],
        dimensions: '23\' x 20\' x 18\'',
        ageRange: 'Ages 4-14',
        capacity: 'Up to 12 kids',
        location: 'Angola',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 230.00 },
          { duration: 'Weekend', price: 390.00 },
          { duration: 'Week', price: 920.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Obstacle Challenge',
        description: 'Exciting obstacle course with multiple challenges and a slide finish.',
        price: 250.00,
        stock: 1,
        categoryId: categoryIds['Obstacle'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/obstacle-challenge.jpg'
          }
        ],
        features: ['Multiple obstacles', 'Competitive play', 'Slide finish'],
        dimensions: '35\' x 12\' x 15\'',
        ageRange: 'Ages 6-16',
        capacity: 'Up to 10 kids',
        location: 'Angola',
        popular: true,
        rentalOptions: [
          { duration: 'Day', price: 250.00 },
          { duration: 'Weekend', price: 425.00 },
          { duration: 'Week', price: 1000.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Castle Bounce House',
        description: 'Classic castle bounce house, perfect for younger children.',
        price: 150.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/castle-bounce-house.jpg'
          }
        ],
        features: ['Castle theme', 'Simple bounce', 'Perfect for young kids'],
        dimensions: '13\' x 13\' x 13\'',
        ageRange: 'Ages 2-10',
        capacity: 'Up to 6 kids',
        location: 'Angola',
        popular: false,
        rentalOptions: [
          { duration: 'Day', price: 150.00 },
          { duration: 'Weekend', price: 255.00 },
          { duration: 'Week', price: 600.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sports Arena Combo',
        description: 'Sports-themed combo with basketball hoop and soccer goal.',
        price: 190.00,
        stock: 1,
        categoryId: categoryIds['Combo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1628864681175-3e4d7b6b1e3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            path: 'products/sports-arena-combo.jpg'
          }
        ],
        features: ['Basketball hoop', 'Soccer goal', 'Sports theme'],
        dimensions: '17\' x 17\' x 15\'',
        ageRange: 'Ages 4-14',
        capacity: 'Up to 8 kids',
        location: 'Angola',
        popular: false,
        rentalOptions: [
          { duration: 'Day', price: 190.00 },
          { duration: 'Weekend', price: 325.00 },
          { duration: 'Week', price: 760.00 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  // Function to add products
  async function addBounceHouses(categoryIds) {
    console.log('Adding bounce houses...');
    const products = getBounceHouseData(categoryIds);
    
    // First, clear existing products
    const productsSnapshot = await db.collection('products').get();
    const deletePromises = [];
    
    productsSnapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    console.log('Cleared existing products');
    
    // Add new products
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
      // Add categories and then products
      const categoryIds = await addCategories();
      await addBounceHouses(categoryIds);
      
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
