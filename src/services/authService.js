import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const staffCollection = 'staff';
const userCollection = 'users';
const rolesCollection = 'roles';

// Sign in with email and password (for admin users)
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    try {
      // Check if user is a staff member
      const staffData = await getStaffData(user.uid);
      
      if (staffData) {
        // Check if staff is active
        if (staffData.status !== 'Active') {
          await signOut(auth);
          throw new Error('Your account is inactive. Please contact an administrator.');
        }
        
        // Get role data if roleId exists
        let roleData = null;
        if (staffData.roleId) {
          try {
            const roleRef = doc(db, rolesCollection, staffData.roleId);
            const roleDoc = await getDoc(roleRef);
            if (roleDoc.exists()) {
              roleData = {
                id: roleDoc.id,
                ...roleDoc.data()
              };
            }
          } catch (roleError) {
            console.error('Error fetching role data:', roleError);
          }
        }
        
        // Combine permissions from role and direct permissions
        const rolePermissions = roleData?.permissions || [];
        const directPermissions = staffData.permissions || [];
        const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || staffData.name,
          role: staffData.role,
          roleId: staffData.roleId,
          roleName: roleData?.name || staffData.role,
          permissions: allPermissions,
          staffId: staffData.id,
          isStaff: true
        };
      }
    } catch (error) {
      console.error('Error checking staff data:', error);
      // Continue with regular user flow if there's a permission error
    }
    
    try {
      // Check if they're a regular user
      const userData = await getUserData(user.uid);
      
      if (userData) {
        // Return regular user data
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userData.name,
          isCustomer: true
        };
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      // Continue with default user creation if there's a permission error
    }
    
    // If not a staff member or regular user, create a user record
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      isCustomer: true
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        try {
          // First check if user is staff
          try {
            const staffData = await getStaffData(user.uid);
            
            if (staffData && staffData.status === 'Active') {
              // Get role data if roleId exists
              let roleData = null;
              if (staffData.roleId) {
                try {
                  const roleRef = doc(db, rolesCollection, staffData.roleId);
                  const roleDoc = await getDoc(roleRef);
                  if (roleDoc.exists()) {
                    roleData = {
                      id: roleDoc.id,
                      ...roleDoc.data()
                    };
                  }
                } catch (roleError) {
                  console.error('Error fetching role data:', roleError);
                }
              }
              
              // Combine permissions from role and direct permissions
              const rolePermissions = roleData?.permissions || [];
              const directPermissions = staffData.permissions || [];
              const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];
              
              resolve({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || staffData.name,
                role: staffData.role,
                roleId: staffData.roleId,
                roleName: roleData?.name || staffData.role,
                permissions: allPermissions,
                staffId: staffData.id,
                isStaff: true
              });
              return;
            }
          } catch (error) {
            console.error('Error getting staff data:', error);
            // Continue checking if regular user
          }
          
          // If not staff, check if regular user
          try {
            const userData = await getUserData(user.uid);
            
            if (userData) {
              resolve({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || userData.name,
                isCustomer: true
              });
              return;
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            // Continue with default user data
          }
          
          // Return default user data if no records found
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isCustomer: true
          });
        } catch (error) {
          console.error('Error in auth check:', error);
          // Return basic user info if there are errors
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isCustomer: true
          });
        }
      } else {
        resolve(null);
      }
    }, reject);
  });
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Get staff data by auth UID
export const getStaffData = async (authUid) => {
  try {
    // Query staff collection to find the staff with matching authUid
    const staffRef = doc(db, staffCollection, authUid);
    const staffDoc = await getDoc(staffRef);
    
    if (staffDoc.exists()) {
      return {
        id: staffDoc.id,
        ...staffDoc.data(),
        joinDate: staffDoc.data().joinDate?.toDate(),
        updatedAt: staffDoc.data().updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting staff data:', error);
    throw error;
  }
};

// Get user data by auth UID
export const getUserData = async (authUid) => {
  try {
    // Query users collection to find the user with matching authUid
    const userRef = doc(db, userCollection, authUid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate(),
        updatedAt: userDoc.data().updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if user has specific permission
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Check if user has the specific permission
  return user.permissions && user.permissions.includes(permission);
};

// Check if user has admin role
export const isAdmin = (user) => {
  if (!user) return false;
  
  // Check if user has the Admin role name or has manage_staff permission
  return (user.roleName === 'Admin' || user.role === 'Admin' || 
          (user.permissions && user.permissions.includes('manage_staff')));
};

// Check if user has manager role or higher
export const isManagerOrAdmin = (user) => {
  if (!user) return false;
  
  // Check if user has Admin or Manager role, or has manage_products permission
  return (user.roleName === 'Admin' || user.role === 'Admin' || 
          user.roleName === 'Manager' || user.role === 'Manager' ||
          (user.permissions && user.permissions.includes('manage_products')));
};

// Get all available roles
export const getRoles = async () => {
  try {
    const rolesRef = collection(db, rolesCollection);
    const snapshot = await getDocs(rolesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting roles:', error);
    return [];
  }
};
