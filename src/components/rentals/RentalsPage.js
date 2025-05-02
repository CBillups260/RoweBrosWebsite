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
  faTimes,
  faChevronDown,
  faCalendarAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import PlaceholderImage from '../common/PlaceholderImage';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker-custom.css';
import '../../styles/rentals-page.css';

const RentalsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  // Available time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Calculate the minimum allowed booking date (tomorrow)
  const minBookingDate = new Date();
  minBookingDate.setDate(minBookingDate.getDate() + 1); // Add 24-hour buffer
  
  // Calculate the maximum allowed booking date (12 months from today)
  const maxBookingDate = new Date();
  maxBookingDate.setFullYear(maxBookingDate.getFullYear() + 1);

  // Format dates for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleQuickView = (item) => {
    setQuickViewItem(item);
    // Reset date/time selections when opening quick view for a new item
    setSelectedDate(null);
    setSelectedTime('');
    setAddedToCart(false);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    setQuickViewItem(null);
    document.body.style.overflow = 'auto';
  };

  const handleAddToCart = () => {
    if (!selectedDate) {
      alert('Please select a rental date before adding to cart');
      return;
    }
    
    if (!selectedTime) {
      alert('Please select a time slot before adding to cart');
      return;
    }
    
    // Format the rental item properly before adding to cart
    const rentalItem = {
      id: quickViewItem.id,
      name: quickViewItem.name,
      price: quickViewItem.price,
      priceNumeric: quickViewItem.priceNumeric, // Add numeric price for calculations
      // Use the proper Firebase image URL
      mainImage: quickViewItem.image,
      category: quickViewItem.category || '',
      location: quickViewItem.location || 'Elkhart'
    };
    
    // Create a new date object with the selected date and time
    const dateTimeObj = new Date(selectedDate);
    
    // Add the time information to the cart item
    const bookingInfo = {
      date: dateTimeObj,
      time: selectedTime
    };
    
    // Send the booking info to the cart
    addToCart(rentalItem, bookingInfo);
    setAddedToCart(true);
    
    // Reset added to cart message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
      closeQuickView();
    }, 3000);
  };

  // Helper function to get first sentence of a description
  const getShortDescription = (description) => {
    if (!description) return '';
    
    // Match first sentence (ending with period, exclamation, question mark)
    const match = description.match(/^(.*?[.!?])\s/);
    
    if (match) {
      // Return first sentence + ellipsis
      return match[1] + '...';
    } else if (description.length > 100) {
      // If no sentence found, truncate at 100 chars
      return description.substring(0, 100).trim() + '...';
    } else {
      // If description is already short enough, return as is
      return description;
    }
  };

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
          priceNumeric: product.price,
          description: product.description,
          shortDescription: product.shortDescription || getShortDescription(product.description), // Use shortDescription if exists, otherwise generate one
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
    
    // Filter by price range - use numeric price value directly from Firebase
    filtered = filtered.filter(product => {
      // Use the numeric price directly from Firebase
      const price = product.price ? parseFloat(product.price) : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort products - use numeric price value directly from Firebase
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.popular === a.popular) ? 0 : b.popular ? 1 : -1);
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.price ? parseFloat(a.price) : 0;
          const priceB = b.price ? parseFloat(b.price) : 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.price ? parseFloat(a.price) : 0;
          const priceB = b.price ? parseFloat(b.price) : 0;
          return priceB - priceA;
        });
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
      priceNumeric: product.price, // Store numeric price for calculations
      description: product.description,
      shortDescription: product.shortDescription || getShortDescription(product.description), // Use shortDescription if exists, otherwise generate one
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
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <PlaceholderImage alt={item.name} />
                      )}
                      <Link to={`/rentals/${item.id}`} className="view-details">
                        View Details
                      </Link>
                      <button 
                        className="quick-view"
                        onClick={() => handleQuickView(item)}
                      >
                        Quick Book
                      </button>
                    </div>
                    <div className="rental-info">
                      <h4>{item.name}</h4>
                      <p className="price">{item.price}</p>
                      <p className="short-description">{item.shortDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewItem && (
        <div className="quick-view-modal">
          <div className="quick-view-backdrop" onClick={closeQuickView}></div>
          <div className="quick-view-content">
            <button className="close-quick-view" onClick={closeQuickView}>×</button>
            
            <div className="quick-view-grid">
              <div className="quick-view-image">
                {quickViewItem.image ? (
                  <img src={quickViewItem.image} alt={quickViewItem.name} />
                ) : (
                  <PlaceholderImage alt={quickViewItem.name} />
                )}
              </div>
              
              <div className="quick-view-info">
                <h2>{quickViewItem.name}</h2>
                <p className="quick-view-price">{quickViewItem.price}</p>
                <p className="quick-view-description">{quickViewItem.description}</p>
                
                <div className="quick-view-booking">
                  <div className="date-selection">
                    <label htmlFor="rental-date">
                      <FontAwesomeIcon icon={faCalendarAlt} /> Select Date:
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      minDate={minBookingDate}
                      maxDate={maxBookingDate}
                      placeholderText="Click to select a date"
                      dateFormat="MMMM d, yyyy"
                      className="custom-datepicker"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    {selectedDate && (
                      <div className="selected-date-confirmation">
                        <FontAwesomeIcon icon={faCheck} /> Selected: {formatDateForDisplay(selectedDate)}
                      </div>
                    )}
                  </div>
                  
                  <div className="time-selection">
                    <label htmlFor="rental-time">
                      <FontAwesomeIcon icon={faClock} /> Select Time:
                    </label>
                    <select 
                      id="rental-time"
                      className="time-select"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((time, index) => (
                        <option key={index} value={time}>{time}</option>
                      ))}
                    </select>
                    {selectedTime && (
                      <div className="selected-time-confirmation">
                        <FontAwesomeIcon icon={faCheck} /> Time: {selectedTime}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="add-to-cart-button" 
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                  >
                    {addedToCart ? (
                      <span>
                        <FontAwesomeIcon icon={faCheck} /> Added to Cart
                      </span>
                    ) : (
                      <span>
                        <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsPage;
