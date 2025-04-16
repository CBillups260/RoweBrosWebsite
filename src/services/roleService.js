import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const rolesCollection = 'roles';

// Get all roles
export const getRoles = async () => {
  const rolesRef = collection(db, rolesCollection);
  const snapshot = await getDocs(rolesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Get a single role by ID
export const getRoleById = async (id) => {
  const roleRef = doc(db, rolesCollection, id);
  const roleDoc = await getDoc(roleRef);
  
  if (roleDoc.exists()) {
    const data = roleDoc.data();
    return {
      id: roleDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    };
  } else {
    return null;
  }
};

// Add a new role
export const addRole = async (roleData) => {
  // Check if role with same name already exists
  const rolesRef = collection(db, rolesCollection);
  const q = query(rolesRef, where("name", "==", roleData.name));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error(`Role with name "${roleData.name}" already exists`);
  }
  
  const newRole = {
    name: roleData.name,
    description: roleData.description || '',
    permissions: roleData.permissions || [],
    isSystem: false, // System roles cannot be modified
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(rolesRef, newRole);
  return {
    id: docRef.id,
    ...newRole,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Update an existing role
export const updateRole = async (id, roleData) => {
  const roleRef = doc(db, rolesCollection, id);
  
  // Get current role data
  const roleDoc = await getDoc(roleRef);
  if (!roleDoc.exists()) {
    throw new Error('Role not found');
  }
  
  const currentData = roleDoc.data();
  
  // Check if this is a system role
  if (currentData.isSystem) {
    throw new Error('System roles cannot be modified');
  }
  
  // Check if name is being changed and if it conflicts
  if (roleData.name && roleData.name !== currentData.name) {
    const rolesRef = collection(db, rolesCollection);
    const q = query(rolesRef, where("name", "==", roleData.name));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error(`Role with name "${roleData.name}" already exists`);
    }
  }
  
  // Prepare update data
  const updatedData = {
    ...roleData,
    updatedAt: serverTimestamp()
  };
  
  // Remove fields that shouldn't be updated
  delete updatedData.isSystem;
  delete updatedData.createdAt;
  
  // Update Firestore document
  await updateDoc(roleRef, updatedData);
  
  return {
    id,
    ...currentData,
    ...updatedData,
    updatedAt: new Date()
  };
};

// Delete a role
export const deleteRole = async (id) => {
  const roleRef = doc(db, rolesCollection, id);
  
  // Get current role data to check if it's a system role
  const roleDoc = await getDoc(roleRef);
  if (!roleDoc.exists()) {
    throw new Error('Role not found');
  }
  
  const roleData = roleDoc.data();
  
  // Check if this is a system role
  if (roleData.isSystem) {
    throw new Error('System roles cannot be deleted');
  }
  
  // Check if any staff members are using this role
  const staffRef = collection(db, 'staff');
  const q = query(staffRef, where("roleId", "==", id));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error('Cannot delete role that is assigned to staff members');
  }
  
  // Delete Firestore document
  await deleteDoc(roleRef);
  
  return id;
};

// Get all available permissions
export const getAvailablePermissions = async () => {
  // This could be fetched from Firestore or defined statically
  return [
    {
      id: 'manage_products',
      name: 'Manage Products',
      description: 'Create, edit, and delete products'
    },
    {
      id: 'view_products',
      name: 'View Products',
      description: 'View product details'
    },
    {
      id: 'manage_categories',
      name: 'Manage Categories',
      description: 'Create, edit, and delete categories'
    },
    {
      id: 'view_categories',
      name: 'View Categories',
      description: 'View category details'
    },
    {
      id: 'manage_orders',
      name: 'Manage Orders',
      description: 'Process and update orders'
    },
    {
      id: 'view_orders',
      name: 'View Orders',
      description: 'View order details'
    },
    {
      id: 'manage_staff',
      name: 'Manage Staff',
      description: 'Create, edit, and delete staff members'
    },
    {
      id: 'view_staff',
      name: 'View Staff',
      description: 'View staff details'
    },
    {
      id: 'manage_roles',
      name: 'Manage Roles',
      description: 'Create, edit, and delete roles'
    },
    {
      id: 'view_roles',
      name: 'View Roles',
      description: 'View role details'
    },
    {
      id: 'view_sales',
      name: 'View Sales',
      description: 'View sales reports and analytics'
    },
    {
      id: 'manage_settings',
      name: 'Manage Settings',
      description: 'Update system settings'
    }
  ];
};

// Initialize default roles when the application starts
export const ensureDefaultRolesExist = async () => {
  try {
    console.log('Checking for existing roles...');
    // First try to get roles without writing anything
    const rolesRef = collection(db, rolesCollection);
    const snapshot = await getDocs(rolesRef);
    
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.docs.length} existing roles.`);
      return false; // Roles already exist, no need to create defaults
    }
    
    // Only try to create roles if none exist
    console.log('No roles found. Creating default roles...');
    
    const permissions = await getAvailablePermissions();
    const allPermissionIds = permissions.map(p => p.id);
    
    const defaultRoles = [
      {
        name: 'Admin',
        description: 'Full access to all system features',
        permissions: allPermissionIds,
        isSystem: true
      },
      {
        name: 'Manager',
        description: 'Access to most features except staff and role management',
        permissions: allPermissionIds.filter(p => 
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
    
    // Add all default roles
    for (const role of defaultRoles) {
      await addRole(role);
      console.log(`Created role: ${role.name}`);
    }
    
    return true;
  } catch (error) {
    // If we get a permission error, log it but don't throw
    console.error('Error initializing roles:', error);
    // Return false to indicate we didn't create new roles, but don't break the app
    return false;
  }
};

// Initialize default roles
export const initializeDefaultRoles = async () => {
  const permissions = await getAvailablePermissions();
  const allPermissionIds = permissions.map(p => p.id);
  
  const defaultRoles = [
    {
      name: 'Admin',
      description: 'Full access to all system features',
      permissions: allPermissionIds,
      isSystem: true
    },
    {
      name: 'Manager',
      description: 'Access to most features except staff and role management',
      permissions: allPermissionIds.filter(p => 
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
  
  const rolesRef = collection(db, rolesCollection);
  const snapshot = await getDocs(rolesRef);
  
  // Only add default roles if none exist
  if (snapshot.empty) {
    for (const role of defaultRoles) {
      await addDoc(rolesRef, {
        ...role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  }
  
  return false;
};
