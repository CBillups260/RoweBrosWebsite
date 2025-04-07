import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const ordersCollection = 'orders';
const productsCollection = 'products';

// Get sales data for a specific date range
export const getSalesData = async (startDate, endDate) => {
  try {
    const ordersRef = collection(db, ordersCollection);
    
    // Convert dates to Firestore timestamps
    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    const endTimestamp = Timestamp.fromDate(new Date(endDate));
    
    // Query orders within the date range
    const q = query(
      ordersRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    // Map orders data
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
    
    // Calculate sales metrics
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Get product sales data
    const productSales = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      }
    });
    
    // Convert to array and sort by revenue
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Calculate daily sales
    const dailySales = {};
    orders.forEach(order => {
      if (order.createdAt) {
        const dateStr = order.createdAt.toISOString().split('T')[0];
        if (!dailySales[dateStr]) {
          dailySales[dateStr] = {
            date: dateStr,
            revenue: 0,
            orders: 0
          };
        }
        dailySales[dateStr].revenue += order.totalAmount || 0;
        dailySales[dateStr].orders += 1;
      }
    });
    
    // Convert to array and sort by date
    const salesByDay = Object.values(dailySales)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get payment method breakdown
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.paymentMethod || 'Unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          method,
          count: 0,
          amount: 0
        };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].amount += order.totalAmount || 0;
    });
    
    // Convert to array
    const paymentMethodsArray = Object.values(paymentMethods);
    
    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByDay,
      paymentMethods: paymentMethodsArray,
      orders
    };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

// Get top selling products
export const getTopSellingProducts = async (limit = 5, timeframe = 'all') => {
  try {
    const ordersRef = collection(db, ordersCollection);
    let q = query(ordersRef);
    
    // Apply timeframe filter if not 'all'
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      const startTimestamp = Timestamp.fromDate(startDate);
      q = query(
        ordersRef,
        where('createdAt', '>=', startTimestamp)
      );
    }
    
    const snapshot = await getDocs(q);
    
    // Process orders to get product sales
    const productSales = {};
    
    snapshot.docs.forEach(doc => {
      const order = {
        id: doc.id,
        ...doc.data()
      };
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      }
    });
    
    // Convert to array, sort by quantity, and limit
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
};

// Get sales summary for dashboard
export const getSalesSummary = async () => {
  try {
    const ordersRef = collection(db, ordersCollection);
    
    // Get all orders
    const snapshot = await getDocs(ordersRef);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date at midnight
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get start of last month
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Get end of last month
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Calculate revenue for different time periods
    const todayRevenue = orders
      .filter(order => order.createdAt >= today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const yesterdayRevenue = orders
      .filter(order => order.createdAt >= yesterday && order.createdAt < today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const thisMonthRevenue = orders
      .filter(order => order.createdAt >= startOfMonth)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const lastMonthRevenue = orders
      .filter(order => order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate growth rates
    const dailyGrowth = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    return {
      totalRevenue,
      todayRevenue,
      yesterdayRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      dailyGrowth,
      monthlyGrowth,
      totalOrders: orders.length
    };
    
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
};

// Get recent orders for dashboard
export const getRecentOrders = async (limitCount = 5) => {
  try {
    const ordersRef = collection(db, ordersCollection);
    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
    
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};
