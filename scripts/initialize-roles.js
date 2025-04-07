const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where,
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
const availablePermissions = [
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

// Default roles
const defaultRoles = [
  {
    name: 'Admin',
    description: 'Full access to all system features',
    permissions: availablePermissions,
    isSystem: true
  },
  {
    name: 'Manager',
    description: 'Access to most features except staff and role management',
    permissions: availablePermissions.filter(p => 
      p !== 'manage_staff' && 
      p !== 'manage_roles'
    ),
    isSystem: true
  },
  {
    name: 'Staff',
    description: 'Limited access to basic features',
    permissions: [
      'view_products',
      'view_categories',
      'view_orders',
      'manage_orders'
    ],
    isSystem: true
  }
];

// Initialize roles
const initializeRoles = async () => {
  try {
    console.log('Checking for existing roles...');
    const rolesRef = collection(db, 'roles');
    const snapshot = await getDocs(rolesRef);
    
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.size} existing roles. Checking for missing default roles...`);
      
      // Check if any default roles are missing
      for (const defaultRole of defaultRoles) {
        const roleQuery = query(rolesRef, where('name', '==', defaultRole.name));
        const roleSnapshot = await getDocs(roleQuery);
        
        if (roleSnapshot.empty) {
          console.log(`Adding missing default role: ${defaultRole.name}`);
          await addDoc(rolesRef, {
            ...defaultRole,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          console.log(`Default role already exists: ${defaultRole.name}`);
        }
      }
    } else {
      console.log('No roles found. Creating default roles...');
      
      // Add all default roles
      for (const role of defaultRoles) {
        await addDoc(rolesRef, {
          ...role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Created role: ${role.name}`);
      }
    }
    
    console.log('Role initialization complete!');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

// Run the initialization
initializeRoles()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
