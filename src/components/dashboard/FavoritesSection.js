import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';

const FavoritesSection = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();
  
  useEffect(() => {
    // In a real app, you would fetch favorites from Firebase
    // For now, we'll use mock data
    const fetchFavorites = () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockFavorites = [
          {
            id: 1,
            name: 'Bounce House',
            price: 199.99,
            image: '/images/bounce-house.jpg',
            category: 'Inflatables'
          },
          {
            id: 2,
            name: 'Water Slide',
            price: 299.99,
            image: '/images/water-slide.jpg',
            category: 'Inflatables'
          },
          {
            id: 3,
            name: 'Cotton Candy Machine',
            price: 50.00,
            image: '/images/cotton-candy-machine.jpg',
            category: 'Concessions'
          }
        ];
        
        setFavorites(mockFavorites);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchFavorites();
  }, []);
  
  const filteredFavorites = favorites.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };
  
  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  };
  
  return (
    <div className="dashboard-section favorites-section">
      <div className="section-header">
        <h2>My Favorites</h2>
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading your favorites...</div>
      ) : filteredFavorites.length > 0 ? (
        <div className="favorites-grid">
          {filteredFavorites.map(item => (
            <div key={item.id} className="favorite-card">
              <button 
                className="remove-favorite"
                onClick={() => handleRemoveFavorite(item.id)}
                aria-label="Remove from favorites"
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
              
              <Link to={`/rentals/${item.id}`} className="favorite-image">
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </Link>
              
              <div className="favorite-details">
                <Link to={`/rentals/${item.id}`} className="favorite-name">
                  {item.name}
                </Link>
                <div className="favorite-category">{item.category}</div>
                <div className="favorite-price">${item.price.toFixed(2)}</div>
              </div>
              
              <button 
                className="add-to-cart"
                onClick={() => handleAddToCart(item)}
              >
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No favorites found{searchTerm ? ' matching your search' : ''}.</p>
          {searchTerm ? (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          ) : (
            <Link to="/rentals" className="browse-link">Browse Rentals</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
