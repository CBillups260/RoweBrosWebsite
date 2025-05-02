import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearchPlus, 
  faTimes, 
  faRuler, 
  faChild, 
  faUsers, 
  faWeight, 
  faBolt, 
  faTruck, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import PlaceholderImage from '../common/PlaceholderImage';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import '../../styles/rentals.css';

const FeaturedRentals = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredRentals, setFilteredRentals] = useState([]);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products from Firebase
        const productsData = await getProducts();
        setProducts(productsData);
        
        // Fetch categories from Firebase
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Convert Firebase products to the format expected by the UI
        const formattedProducts = productsData
          .filter(product => product.popular) // Only show popular products
          .map(product => ({
            id: product.id,
            name: product.name,
            price: `$${product.price}/day`,
            description: product.description,
            dimensions: product.dimensions || '',
            ageRange: product.ageRange || '',
            capacity: product.capacity || '',
            image: product.images && product.images.length > 0 ? product.images[0].url : '',
            category: product.categoryId,
            popular: product.popular || false,
            location: product.location || 'Elkhart'
          }));
        
        setFilteredRentals(formattedProducts);
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

  // Update filtered rentals when filter changes
  useEffect(() => {
    if (!products.length) return;
    
    let filtered = [...products];
    
    // Filter by category if not 'all'
    if (activeFilter !== 'all') {
      const categoryId = categories.find(cat => cat.name.toLowerCase() === activeFilter.toLowerCase())?.id;
      
      if (categoryId) {
        filtered = filtered.filter(product => product.categoryId === categoryId);
      }
    }
    
    // Only show popular products
    filtered = filtered.filter(product => product.popular);
    
    // Format products for display
    const formattedProducts = filtered.map(product => ({
      id: product.id,
      name: product.name,
      price: `$${product.price}/day`,
      description: product.description,
      dimensions: product.dimensions || '',
      ageRange: product.ageRange || '',
      capacity: product.capacity || '',
      image: product.images && product.images.length > 0 ? product.images[0].url : '',
      category: product.categoryId,
      popular: product.popular || false,
      location: product.location || 'Elkhart'
    }));
    
    setFilteredRentals(formattedProducts);
  }, [activeFilter, products, categories]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleQuickView = (id) => {
    setExpandedItem(id);
    document.body.style.overflow = 'hidden';
  };

  const closeExpandedInfo = () => {
    setExpandedItem(null);
    document.body.style.overflow = 'auto';
  };

  // Get category names for filters
  const getCategoryFilters = () => {
    // Extract unique category names to create filter buttons
    if (!categories.length) return [];
    
    // Get categories that have popular products
    const popularCategoryIds = new Set(
      products
        .filter(product => product.popular)
        .map(product => product.categoryId)
    );
    
    // Return categories that have popular products
    return categories.filter(category => popularCategoryIds.has(category.id));
  };

  return (
    <section className="featured-rentals" id="featured-rentals">
      <div className="featured-rentals-container">
        <h2>Check Out Our Most Popular Rentals!</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterClick('all')}
          >
            All Rentals
          </button>
          {getCategoryFilters().map(category => (
            <button
              key={category.id}
              className={`filter-btn ${activeFilter === category.name.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleFilterClick(category.name.toLowerCase())}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading featured rentals...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="featured-rentals-grid">
            {filteredRentals.map(item => (
              <div className="rental-card" key={item.id}>
                <div className="rental-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <PlaceholderImage alt={item.name} />
                  )}
                  <Link to={`/rentals/${item.id}`} className="view-details">
                    View Details
                  </Link>
                </div>
                <div className="rental-info">
                  <h4>{item.name}</h4>
                  <p className="price">{item.price}</p>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="view-all-container">
          <Link to="/rentals" className="view-all-button">
            View All Rentals <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRentals;
