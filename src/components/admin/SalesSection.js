import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faChartBar, 
  faChartPie, 
  faCalendarAlt, 
  faSpinner,
  faDownload,
  faExchangeAlt,
  faDollarSign,
  faShoppingCart,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { getSalesData, getSalesSummary, getTopSellingProducts } from '../../services/salesService';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesSection = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [salesData, setSalesData] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch sales data on component mount and when date range changes
  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);
  
  // Fetch sales summary and top products on component mount
  useEffect(() => {
    fetchSalesSummary();
    fetchTopProducts();
  }, []);
  
  // Fetch sales data based on date range
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const data = await getSalesData(dateRange.startDate, dateRange.endDate);
      setSalesData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch sales summary for dashboard
  const fetchSalesSummary = async () => {
    try {
      const summary = await getSalesSummary();
      setSalesSummary(summary);
    } catch (err) {
      console.error('Error fetching sales summary:', err);
    }
  };
  
  // Fetch top selling products
  const fetchTopProducts = async () => {
    try {
      const products = await getTopSellingProducts(5, 'month');
      setTopProducts(products);
    } catch (err) {
      console.error('Error fetching top products:', err);
    }
  };
  
  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Get growth indicator class
  const getGrowthClass = (value) => {
    return value >= 0 ? 'positive-growth' : 'negative-growth';
  };
  
  // Get growth icon
  const getGrowthIcon = (value) => {
    return value >= 0 ? 
      <FontAwesomeIcon icon={faArrowUp} /> : 
      <FontAwesomeIcon icon={faArrowDown} />;
  };
  
  // Prepare chart data for revenue by day
  const prepareRevenueChartData = () => {
    if (!salesData || !salesData.salesByDay || salesData.salesByDay.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Daily Revenue',
            data: [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
    
    return {
      labels: salesData.salesByDay.map(day => day.date),
      datasets: [
        {
          label: 'Daily Revenue',
          data: salesData.salesByDay.map(day => day.revenue),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // Prepare chart data for orders by day
  const prepareOrdersChartData = () => {
    if (!salesData || !salesData.salesByDay || salesData.salesByDay.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Daily Orders',
            data: [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
    
    return {
      labels: salesData.salesByDay.map(day => day.date),
      datasets: [
        {
          label: 'Daily Orders',
          data: salesData.salesByDay.map(day => day.orders),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // Prepare chart data for top products
  const prepareTopProductsChartData = () => {
    if (!salesData || !salesData.topProducts || salesData.topProducts.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Revenue',
            data: [],
            backgroundColor: [
              '#4CAF50',
              '#2196F3',
              '#FFC107',
              '#9C27B0',
              '#F44336'
            ]
          }
        ]
      };
    }
    
    return {
      labels: salesData.topProducts.slice(0, 5).map(product => product.productName),
      datasets: [
        {
          label: 'Revenue',
          data: salesData.topProducts.slice(0, 5).map(product => product.revenue),
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FFC107',
            '#9C27B0',
            '#F44336'
          ]
        }
      ]
    };
  };
  
  // Prepare chart data for payment methods
  const preparePaymentMethodsChartData = () => {
    if (!salesData || !salesData.paymentMethods || salesData.paymentMethods.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Amount',
            data: [],
            backgroundColor: [
              '#4CAF50',
              '#2196F3',
              '#FFC107',
              '#9C27B0',
              '#F44336'
            ]
          }
        ]
      };
    }
    
    return {
      labels: salesData.paymentMethods.map(method => method.method),
      datasets: [
        {
          label: 'Amount',
          data: salesData.paymentMethods.map(method => method.amount),
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FFC107',
            '#9C27B0',
            '#F44336'
          ]
        }
      ]
    };
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Products by Revenue'
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Payment Methods'
      }
    }
  };
  
  // Handle export data
  const handleExportData = () => {
    if (!salesData) return;
    
    // Prepare data for export
    const exportData = {
      summary: {
        totalSales: salesData.totalSales,
        totalOrders: salesData.totalOrders,
        averageOrderValue: salesData.averageOrderValue,
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`
      },
      salesByDay: salesData.salesByDay,
      topProducts: salesData.topProducts,
      paymentMethods: salesData.paymentMethods
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (loading && !salesData) {
    return (
      <div className="dashboard-section sales-section">
        <div className="loading-indicator">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading sales data...
        </div>
      </div>
    );
  }
  
  if (error && !salesData) {
    return (
      <div className="dashboard-section sales-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section sales-section">
      <div className="section-header">
        <h2>Sales Analytics</h2>
        <div className="date-range-picker">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
          <span>to</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
          <button className="secondary-button" onClick={handleExportData}>
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
        </div>
      </div>
      
      <div className="sales-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FontAwesomeIcon icon={faChartLine} /> Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FontAwesomeIcon icon={faChartBar} /> Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FontAwesomeIcon icon={faChartPie} /> Payments
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <div className="sales-overview">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <div className="metric-value">
                  {formatCurrency(salesData?.totalSales || 0)}
                </div>
                {salesSummary && (
                  <div className={`metric-growth ${getGrowthClass(salesSummary.monthlyGrowth)}`}>
                    {getGrowthIcon(salesSummary.monthlyGrowth)} {formatPercentage(salesSummary.monthlyGrowth)} this month
                  </div>
                )}
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FontAwesomeIcon icon={faShoppingCart} />
              </div>
              <div className="metric-content">
                <h3>Total Orders</h3>
                <div className="metric-value">
                  {salesData?.totalOrders || 0}
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FontAwesomeIcon icon={faExchangeAlt} />
              </div>
              <div className="metric-content">
                <h3>Average Order Value</h3>
                <div className="metric-value">
                  {formatCurrency(salesData?.averageOrderValue || 0)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3>Revenue Trend</h3>
            <Line data={prepareRevenueChartData()} options={lineChartOptions} />
          </div>
          
          <div className="chart-container">
            <h3>Orders Trend</h3>
            <Line data={prepareOrdersChartData()} options={{
              ...lineChartOptions,
              plugins: {
                ...lineChartOptions.plugins,
                title: {
                  display: true,
                  text: 'Orders Trend'
                }
              }
            }} />
          </div>
        </div>
      )}
      
      {activeTab === 'products' && (
        <div className="sales-products">
          <div className="chart-container">
            <h3>Top 5 Products by Revenue</h3>
            <Bar data={prepareTopProductsChartData()} options={barChartOptions} />
          </div>
          
          <div className="top-products-table">
            <h3>Top Selling Products</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.topProducts?.length > 0 ? (
                  salesData.topProducts.map((product, index) => (
                    <tr key={product.productId || index}>
                      <td>{product.productName || 'Unknown Product'}</td>
                      <td>{product.quantity}</td>
                      <td>{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-table-message">
                      No product sales data available for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'payments' && (
        <div className="sales-payments">
          <div className="chart-container pie-chart-container">
            <h3>Payment Methods</h3>
            <Pie data={preparePaymentMethodsChartData()} options={pieChartOptions} />
          </div>
          
          <div className="payment-methods-table">
            <h3>Payment Method Breakdown</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Number of Orders</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.paymentMethods?.length > 0 ? (
                  salesData.paymentMethods.map((method, index) => (
                    <tr key={index}>
                      <td>{method.method}</td>
                      <td>{method.count}</td>
                      <td>{formatCurrency(method.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-table-message">
                      No payment method data available for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesSection;
