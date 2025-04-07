import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch,
  faFilter,
  faSort,
  faEye,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getProducts, deleteProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import ProductForm from './ProductForm';

const ProductsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        
        setProducts(productsData);
        setCategories([{ id: 'all', name: 'All' }, ...categoriesData]);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'low stock':
        return 'status-warning';
      case 'out of stock':
        return 'status-danger';
      default:
        return '';
    }
  };
  
  // Get product status based on stock
  const getProductStatus = (stock) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'Active';
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };
  
  // Handle edit product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowProductForm(true);
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductForm(true);
  };
  
  // Handle product form submission
  const handleProductFormSubmit = (updatedProducts) => {
    setProducts(updatedProducts);
    setShowProductForm(false);
    setCurrentProduct(null);
  };
  
  // Handle product form cancel
  const handleProductFormCancel = () => {
    setShowProductForm(false);
    setCurrentProduct(null);
  };
  
  // Find category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  if (loading) {
    return (
      <div className="dashboard-section products-section">
        <div className="loading-indicator">Loading products...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-section products-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section products-section">
      {showProductForm ? (
        <ProductForm 
          product={currentProduct} 
          categories={categories.filter(cat => cat.id !== 'all')} 
          onSubmit={handleProductFormSubmit}
          onCancel={handleProductFormCancel}
        />
      ) : (
        <>
          <div className="section-header">
            <h2>Products Management</h2>
            <button className="primary-button" onClick={handleAddProduct}>
              <FontAwesomeIcon icon={faPlus} /> Add New Product
            </button>
          </div>
          
          <div className="filters-bar">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-box">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sort-box">
              <FontAwesomeIcon icon={faSort} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.id.substring(0, 8)}...</td>
                      <td>{product.name}</td>
                      <td>{getCategoryName(product.categoryId)}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`product-status ${getStatusClass(getProductStatus(product.stock))}`}>
                          {getProductStatus(product.stock)}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="icon-button view" title="View Product Details">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="icon-button edit" 
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="icon-button delete" 
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-table-message">
                      No products found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {products.length > 0 && sortedProducts.length === 0 && (
            <div className="empty-state">
              <p>No products found matching your search criteria.</p>
            </div>
          )}
          
          {products.length === 0 && (
            <div className="empty-state">
              <p>No products have been added yet. Click "Add New Product" to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsSection;
