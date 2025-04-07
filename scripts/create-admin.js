const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin with service account
// Note: You'll need to create a service account key file from the Firebase console
// Firebase Console > Project Settings > Service Accounts > Generate new private key
try {
  const serviceAccount = require('../serviceAccountKey.json');
  
  // Initialize the app
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  
  const db = getFirestore();
  const auth = getAuth();
  
  async function createAdminUser() {
    const email = 'chris@branddominators.com';
    
    try {
      // Check if user exists in Authentication
      let userRecord;
      
      try {
        // Try to get the user
        userRecord = await auth.getUserByEmail(email);
        console.log('User already exists in Authentication:', userRecord.uid);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create the user if not found
          userRecord = await auth.createUser({
            email: email,
            password: 'Admin123!', // You should change this immediately after creation
            displayName: 'Chris Billups',
            emailVerified: true
          });
          console.log('Created new user in Authentication:', userRecord.uid);
        } else {
          throw error;
        }
      }
      
      // Create or update staff document in Firestore
      const staffRef = db.collection('staff').doc(userRecord.uid);
      
      // Check if staff document exists
      const staffDoc = await staffRef.get();
      
      if (staffDoc.exists) {
        // Update existing document
        await staffRef.update({
          name: 'Chris Billups',
          email: email,
          role: 'Admin',
          status: 'Active',
          permissions: [
            'manage_products', 
            'manage_categories', 
            'manage_staff', 
            'manage_orders', 
            'view_sales'
          ],
          updatedAt: new Date()
        });
        console.log('Updated existing staff document with Admin role');
      } else {
        // Create new document
        await staffRef.set({
          name: 'Chris Billups',
          email: email,
          role: 'Admin',
          status: 'Active',
          permissions: [
            'manage_products', 
            'manage_categories', 
            'manage_staff', 
            'manage_orders', 
            'view_sales'
          ],
          joinDate: new Date(),
          updatedAt: new Date()
        });
        console.log('Created new staff document with Admin role');
      }
      
      console.log(`Successfully made ${email} an admin!`);
      console.log(`UID: ${userRecord.uid}`);
      console.log('You should change the temporary password immediately after logging in.');
      
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
  }
  
  // Run the function
  createAdminUser()
    .then(() => {
      console.log('Admin user creation process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error in admin user creation process:', error);
      process.exit(1);
    });
  
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Make sure you have created a serviceAccountKey.json file in the project root.');
  console.log('You can generate this file from the Firebase console:');
  console.log('Firebase Console > Project Settings > Service Accounts > Generate new private key');
  process.exit(1);
}
