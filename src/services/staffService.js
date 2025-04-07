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
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { db } from '../firebase';

const staffCollection = 'staff';

// Get all staff members
export const getStaffMembers = async () => {
  const staffRef = collection(db, staffCollection);
  const q = query(staffRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamps to JS Date objects
    joinDate: doc.data().joinDate?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Get a single staff member by ID
export const getStaffMemberById = async (id) => {
  const staffRef = doc(db, staffCollection, id);
  const staffDoc = await getDoc(staffRef);
  
  if (staffDoc.exists()) {
    const data = staffDoc.data();
    return {
      id: staffDoc.id,
      ...data,
      joinDate: data.joinDate?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    };
  } else {
    return null;
  }
};

// Add a new staff member
export const addStaffMember = async (staffData) => {
  const auth = getAuth();
  let authUser = null;
  
  try {
    // Create authentication user if email and password provided
    if (staffData.email && staffData.password) {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        staffData.email, 
        staffData.password
      );
      authUser = userCredential.user;
      
      // Update profile with name
      if (staffData.name) {
        await updateProfile(authUser, {
          displayName: staffData.name
        });
      }
    }
    
    // Create staff record in Firestore
    const staffRef = collection(db, staffCollection);
    const newStaff = {
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone || '',
      roleId: staffData.roleId || '', // Store roleId reference
      role: staffData.role || 'Staff', // Keep role name for backward compatibility
      status: staffData.status || 'Active',
      joinDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authUid: authUser ? authUser.uid : null,
      permissions: staffData.permissions || [] // Direct permissions (optional)
    };
    
    // Remove password from data stored in Firestore
    delete newStaff.password;
    
    const docRef = await addDoc(staffRef, newStaff);
    return {
      id: docRef.id,
      ...newStaff,
      joinDate: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    // If there was an error, clean up any created auth user
    if (authUser) {
      try {
        await deleteUser(authUser);
      } catch (deleteError) {
        console.error('Error deleting auth user after staff creation failed:', deleteError);
      }
    }
    throw error;
  }
};

// Update an existing staff member
export const updateStaffMember = async (id, staffData) => {
  const staffRef = doc(db, staffCollection, id);
  
  // Get current staff data
  const staffDoc = await getDoc(staffRef);
  if (!staffDoc.exists()) {
    throw new Error('Staff member not found');
  }
  
  const currentData = staffDoc.data();
  
  // Prepare update data
  const updatedData = {
    ...staffData,
    updatedAt: serverTimestamp()
  };
  
  // Remove sensitive fields that shouldn't be updated directly
  delete updatedData.password;
  delete updatedData.authUid;
  delete updatedData.joinDate;
  
  // Update Firestore document
  await updateDoc(staffRef, updatedData);
  
  // If auth UID exists and name changed, update auth profile
  if (currentData.authUid && staffData.name && staffData.name !== currentData.name) {
    const auth = getAuth();
    if (auth.currentUser && auth.currentUser.uid === currentData.authUid) {
      await updateProfile(auth.currentUser, {
        displayName: staffData.name
      });
    }
  }
  
  return {
    id,
    ...currentData,
    ...updatedData,
    updatedAt: new Date()
  };
};

// Reset staff member password
export const resetStaffPassword = async (email) => {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
  return true;
};

// Delete a staff member
export const deleteStaffMember = async (id) => {
  const staffRef = doc(db, staffCollection, id);
  
  // Get current staff data to check for auth UID
  const staffDoc = await getDoc(staffRef);
  if (!staffDoc.exists()) {
    throw new Error('Staff member not found');
  }
  
  const staffData = staffDoc.data();
  
  // Delete Firestore document
  await deleteDoc(staffRef);
  
  // Note: We don't delete the Auth user here for safety
  // This should be done by an admin through the Firebase console
  // or with a separate, more secure function
  
  return id;
};

// Get staff members by role
export const getStaffMembersByRole = async (roleId) => {
  const staffRef = collection(db, staffCollection);
  const q = query(staffRef, where("roleId", "==", roleId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    joinDate: doc.data().joinDate?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Update staff member status
export const updateStaffStatus = async (id, status) => {
  const staffRef = doc(db, staffCollection, id);
  
  await updateDoc(staffRef, {
    status,
    updatedAt: serverTimestamp()
  });
  
  return {
    id,
    status,
    updatedAt: new Date()
  };
};

// Search staff members
export const searchStaffMembers = async (searchTerm) => {
  // Note: Firestore doesn't support native text search
  // For a real app, consider using Algolia or similar
  // This is a simple implementation that fetches all and filters client-side
  const staffMembers = await getStaffMembers();
  
  return staffMembers.filter(staff => 
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Check if a user has a specific permission
export const checkPermission = async (userId, permission) => {
  try {
    // Get the staff member
    const staffRef = doc(db, staffCollection, userId);
    const staffDoc = await getDoc(staffRef);
    
    if (!staffDoc.exists() || staffDoc.data().status !== 'Active') {
      return false;
    }
    
    const staffData = staffDoc.data();
    
    // Check direct permissions first
    if (staffData.permissions && staffData.permissions.includes(permission)) {
      return true;
    }
    
    // Check role-based permissions
    if (staffData.roleId) {
      const roleRef = doc(db, 'roles', staffData.roleId);
      const roleDoc = await getDoc(roleRef);
      
      if (roleDoc.exists() && roleDoc.data().permissions) {
        return roleDoc.data().permissions.includes(permission);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};
