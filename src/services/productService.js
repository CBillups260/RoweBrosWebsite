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
import { db } from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const productsCollection = 'products';

// Get all products
export const getProducts = async () => {
  const productsRef = collection(db, productsCollection);
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get a single product by ID
export const getProductById = async (id) => {
  const productRef = doc(db, productsCollection, id);
  const productDoc = await getDoc(productRef);
  
  if (productDoc.exists()) {
    return {
      id: productDoc.id,
      ...productDoc.data()
    };
  } else {
    return null;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  const productsRef = collection(db, productsCollection);
  const newProduct = {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(productsRef, newProduct);
  return {
    id: docRef.id,
    ...newProduct
  };
};

// Update an existing product
export const updateProduct = async (id, productData) => {
  const productRef = doc(db, productsCollection, id);
  const updatedData = {
    ...productData,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(productRef, updatedData);
  return {
    id,
    ...updatedData
  };
};

// Delete a product
export const deleteProduct = async (id) => {
  const productRef = doc(db, productsCollection, id);
  await deleteDoc(productRef);
  return id;
};

// Upload product image to Firebase Storage
export const uploadProductImage = async (file, productId) => {
  const storage = getStorage();
  const fileName = `products/${productId}/${file.name}`;
  const storageRef = ref(storage, fileName);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return {
    url: downloadURL,
    path: fileName
  };
};

// Delete product image from Firebase Storage
export const deleteProductImage = async (imagePath) => {
  if (!imagePath) return;
  
  const storage = getStorage();
  const imageRef = ref(storage, imagePath);
  
  try {
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Filter products by category
export const getProductsByCategory = async (categoryId) => {
  const productsRef = collection(db, productsCollection);
  const q = query(productsRef, where("categoryId", "==", categoryId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Search products by name
export const searchProducts = async (searchTerm) => {
  // Note: Firestore doesn't support native text search
  // For a real app, consider using Algolia or similar
  // This is a simple implementation that fetches all and filters client-side
  const products = await getProducts();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Get low stock products
export const getLowStockProducts = async (threshold = 5) => {
  const productsRef = collection(db, productsCollection);
  const q = query(productsRef, where("stock", "<=", threshold));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
