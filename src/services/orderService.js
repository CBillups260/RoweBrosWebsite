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
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

const ordersCollection = 'orders';

// Get all orders
export const getOrders = async () => {
  const ordersRef = collection(db, ordersCollection);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert Firestore timestamps to JS Date objects
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Get orders with pagination
export const getOrdersPaginated = async (startAfter = null, pageSize = 10) => {
  const ordersRef = collection(db, ordersCollection);
  let q;
  
  if (startAfter) {
    q = query(
      ordersRef, 
      orderBy('createdAt', 'desc'), 
      startAfter(startAfter),
      limit(pageSize)
    );
  } else {
    q = query(
      ordersRef, 
      orderBy('createdAt', 'desc'), 
      limit(pageSize)
    );
  }
  
  const snapshot = await getDocs(q);
  
  return {
    orders: snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })),
    lastVisible: snapshot.docs[snapshot.docs.length - 1]
  };
};

// Get a single order by ID
export const getOrderById = async (id) => {
  const orderRef = doc(db, ordersCollection, id);
  const orderDoc = await getDoc(orderRef);
  
  if (orderDoc.exists()) {
    const data = orderDoc.data();
    return {
      id: orderDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    };
  } else {
    return null;
  }
};

// Add a new order
export const addOrder = async (orderData) => {
  const ordersRef = collection(db, ordersCollection);
  const newOrder = {
    ...orderData,
    status: orderData.status || 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(ordersRef, newOrder);
  return {
    id: docRef.id,
    ...newOrder,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Update an existing order
export const updateOrder = async (id, orderData) => {
  const orderRef = doc(db, ordersCollection, id);
  const updatedData = {
    ...orderData,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(orderRef, updatedData);
  return {
    id,
    ...updatedData,
    updatedAt: new Date()
  };
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  const orderRef = doc(db, ordersCollection, id);
  
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp()
  });
  
  return {
    id,
    status,
    updatedAt: new Date()
  };
};

// Delete an order
export const deleteOrder = async (id) => {
  const orderRef = doc(db, ordersCollection, id);
  await deleteDoc(orderRef);
  return id;
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  const ordersRef = collection(db, ordersCollection);
  const q = query(
    ordersRef, 
    where("status", "==", status),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Get orders by customer
export const getOrdersByCustomer = async (customerId) => {
  const ordersRef = collection(db, ordersCollection);
  const q = query(
    ordersRef, 
    where("customerId", "==", customerId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }));
};

// Search orders
export const searchOrders = async (searchTerm) => {
  // Note: Firestore doesn't support native text search
  // For a real app, consider using Algolia or similar
  // This is a simple implementation that fetches all and filters client-side
  const orders = await getOrders();
  
  return orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Get order statistics
export const getOrderStatistics = async () => {
  const orders = await getOrders();
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const processingOrders = orders.filter(order => order.status === 'Processing').length;
  const completedOrders = orders.filter(order => order.status === 'Completed').length;
  const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
  
  const totalRevenue = orders
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + (order.total || 0), 0);
  
  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue
  };
};
