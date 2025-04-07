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

const categoriesCollection = 'categories';

// Get all categories
export const getCategories = async () => {
  const categoriesRef = collection(db, categoriesCollection);
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get a single category by ID
export const getCategoryById = async (id) => {
  const categoryRef = doc(db, categoriesCollection, id);
  const categoryDoc = await getDoc(categoryRef);
  
  if (categoryDoc.exists()) {
    return {
      id: categoryDoc.id,
      ...categoryDoc.data()
    };
  } else {
    return null;
  }
};

// Add a new category
export const addCategory = async (categoryData) => {
  const categoriesRef = collection(db, categoriesCollection);
  const newCategory = {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(categoriesRef, newCategory);
  return {
    id: docRef.id,
    ...newCategory
  };
};

// Update an existing category
export const updateCategory = async (id, categoryData) => {
  const categoryRef = doc(db, categoriesCollection, id);
  const updatedData = {
    ...categoryData,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(categoryRef, updatedData);
  return {
    id,
    ...updatedData
  };
};

// Delete a category
export const deleteCategory = async (id) => {
  const categoryRef = doc(db, categoriesCollection, id);
  await deleteDoc(categoryRef);
  return id;
};

// Get product count for a category
export const getCategoryProductCount = async (categoryId) => {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where("categoryId", "==", categoryId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.length;
};

// Search categories by name
export const searchCategories = async (searchTerm) => {
  // Simple implementation that fetches all and filters client-side
  const categories = await getCategories();
  
  return categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
