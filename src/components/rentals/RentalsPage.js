import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSortAmountDown, 
  faSortAmountUp,
  faShoppingCart,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import PlaceholderImage from '../common/PlaceholderImage';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import '../../styles/rentals-page.css';

const RentalsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Fetch products and categories from Firebase
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
        const formattedProducts = productsData.map(product => ({
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
  
  // Update filtered rentals when filters change
  useEffect(() => {
    filterAndSortRentals();
  }, [activeFilter, searchTerm, sortBy, priceRange, products]);

  // Filter and sort products
  const filterAndSortRentals = () => {
    if (!products.length) return;
    
    let filtered = [...products];
    
    // Filter by category
    if (activeFilter !== 'all') {
      // Find category ID that matches the active filter name
      const category = categories.find(cat => cat.name.toLowerCase() === activeFilter.toLowerCase());
      if (category) {
        filtered = filtered.filter(product => product.categoryId === category.id);
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort products
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.popular === a.popular) ? 0 : b.popular ? 1 : -1);
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    // Convert Firebase products to the format expected by the UI
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
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePriceRangeChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
    setSortBy('popular');
    setPriceRange([0, 300]);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleQuickAdd = (rental) => {
    // Generate today's date in YYYY-MM-DD format
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // Add the item to the cart
    addToCart(rental, formattedDate);
    
    // Update local state to show the item was added
    setCartItems(prev => ({
      ...prev,
      [rental.id]: true
    }));
    
    // Reset the "Added" indicator after 2 seconds
    setTimeout(() => {
      setCartItems(prev => ({
        ...prev,
        [rental.id]: false
      }));
    }, 2000);
  };

  return (
    <div className="rentals-page">
      <div className="rentals-hero">
        <div className="container">
          <h1>Our Rental Inventory</h1>
          <p>Browse our selection of bounce houses, water slides, and obstacle courses for your next event!</p>
        </div>
      </div>
      
      <div className="rentals-container container">
        <div className="rentals-toolbar">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search rentals..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          
          <div className="filter-toggle" onClick={toggleFilters}>
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
            <FontAwesomeIcon icon={faChevronDown} className={showFilters ? 'rotated' : ''} />
          </div>
          
          <div className="sort-dropdown">
            <label>
              <FontAwesomeIcon icon={faSortAmountDown} />
              <select value={sortBy} onChange={handleSortChange}>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-section">
              <h3>Categories</h3>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterClick('all')}
                >
                  All Rentals
                </button>
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className={`filter-btn ${activeFilter === category.name ? 'active' : ''}`}
                    onClick={() => handleFilterClick(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-range">
                <div className="range-inputs">
                  <div className="range-input">
                    <label>Min:</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="300" 
                      value={priceRange[0]} 
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                    />
                  </div>
                  <div className="range-input">
                    <label>Max:</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="300" 
                      value={priceRange[1]} 
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                    />
                  </div>
                </div>
                <div className="range-slider">
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    value={priceRange[0]} 
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    value={priceRange[1]} 
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                  />
                </div>
              </div>
            </div>
            
            <button className="clear-filters" onClick={clearFilters}>
              <FontAwesomeIcon icon={faTimes} />
              Clear All Filters
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading rentals...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredRentals.length} {filteredRentals.length === 1 ? 'rental' : 'rentals'}
            </div>
            
            {filteredRentals.length === 0 ? (
              <div className="no-results">
                <h3>No rentals found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="clear-filters" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="rentals-grid">
                {filteredRentals.map(item => (
                  <div className="rental-card" key={item.id}>
                    <div className="rental-image">
                      <PlaceholderImage alt={item.name} />
                      <Link to={`/rentals/${item.id}`} className="view-details">
                        View Details
                      </Link>
                      <button 
                        className={`quick-add ${cartItems[item.id] ? 'added' : ''}`}
                        onClick={() => handleQuickAdd(item)}
                        disabled={cartItems[item.id]}
                      >
                        {cartItems[item.id] ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} /> Added
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faShoppingCart} /> Quick Add
                          </>
                        )}
                      </button>
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
          </>
        )}
      </div>
    </div>
  );
};

export default RentalsPage;
