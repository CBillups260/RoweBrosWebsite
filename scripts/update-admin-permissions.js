const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp 
} = require('firebase/firestore');
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDGQUPXpGYkXc0Xvl0jYwQXKGRHKGrYRBk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rowebros-bounce-houses.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rowebros-bounce-houses",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rowebros-bounce-houses.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1019399039063",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1019399039063:web:a3d3a8e3e7e0c8d5b5b5b5"
};

console.log('Using Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Available permissions
const allPermissions = [
  'manage_products',
  'view_products',
  'manage_categories',
  'view_categories',
  'manage_orders',
  'view_orders',
  'manage_staff',
  'view_staff',
  'manage_roles',
  'view_roles',
  'view_sales',
  'manage_settings'
];

// Update admin user permissions
const updateAdminPermissions = async () => {
  try {
    console.log('Looking for admin user...');
    
    // Find the admin user by email
    const staffRef = collection(db, 'staff');
    const q = query(staffRef, where("email", "==", "chris@branddominators.com"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Admin user not found. Please make sure the admin user exists.');
      return false;
    }
    
    // Get the admin user document
    const adminDoc = snapshot.docs[0];
    const adminId = adminDoc.id;
    const adminData = adminDoc.data();
    
    console.log(`Found admin user: ${adminData.name} (${adminData.email})`);
    
    // Check if we need to update the role
    let roleId = adminData.roleId;
    
    if (!roleId) {
      // Find the Admin role
      const rolesRef = collection(db, 'roles');
      const roleQuery = query(rolesRef, where("name", "==", "Admin"));
      const roleSnapshot = await getDocs(roleQuery);
      
      if (!roleSnapshot.empty) {
        roleId = roleSnapshot.docs[0].id;
        console.log(`Found Admin role with ID: ${roleId}`);
      } else {
        console.log('Admin role not found. Creating default roles first might be necessary.');
      }
    }
    
    // Update the admin user with all permissions and the Admin role
    const adminRef = doc(db, 'staff', adminId);
    await updateDoc(adminRef, {
      permissions: allPermissions,
      roleId: roleId || '',
      role: 'Admin',
      status: 'Active',
      updatedAt: serverTimestamp()
    });
    
    console.log('Admin user updated with all permissions!');
    return true;
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    return false;
  }
};

// Run the update
updateAdminPermissions()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
