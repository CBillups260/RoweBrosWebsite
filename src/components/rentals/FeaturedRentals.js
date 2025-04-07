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
import '../../styles/rentals.css';

const FeaturedRentals = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);

  // This would normally be fetched from an API
  const rentalItems = [
    // Elkhart Location
    {
      id: 1,
      name: 'Blue Marble Combo',
      price: '$175/day',
      description: 'Exciting combo bounce house with slide and basketball hoop.',
      dimensions: '15\' x 15\' x 15\'',
      ageRange: 'Ages 3-12',
      capacity: 'Up to 8 kids',
      image: '/images/placeholders/blue-marble-combo.jpg',
      category: 'combo',
      popular: true,
      location: 'Elkhart'
    },
    {
      id: 3,
      name: 'Tropical XL Dual Lane Combo',
      price: '$225/day',
      description: 'Tropical paradise with dual racing lanes and large bounce area.',
      dimensions: '22\' x 20\' x 18\'',
      ageRange: 'Ages 5-15',
      capacity: 'Up to 12 kids',
      image: '/images/placeholders/tropical-xl-dual-lane-combo.jpg',
      category: 'combo',
      popular: true,
      location: 'Elkhart'
    },
    {
      id: 5,
      name: 'Rainbow Dual Lane Combo',
      price: '$220/day',
      description: 'Vibrant rainbow-themed combo with dual racing slides.',
      dimensions: '21\' x 18\' x 17\'',
      ageRange: 'Ages 4-14',
      capacity: 'Up to 12 kids',
      image: '/images/placeholders/rainbow-dual-lane-combo.jpg',
      category: 'combo',
      popular: true,
      location: 'Elkhart'
    },
    // Angola Location
    {
      id: 6,
      name: 'Sunrise Waterslide',
      price: '$195/day',
      description: 'Refreshing water slide with pool at the bottom for hot summer days.',
      dimensions: '25\' x 12\' x 18\'',
      ageRange: 'Ages 5-15',
      capacity: 'Up to 8 kids',
      image: '/images/placeholders/sunrise-waterslide.jpg',
      category: 'slide',
      popular: true,
      location: 'Angola'
    },
    {
      id: 7,
      name: 'Dinosaur XL Dual Lane Combo',
      price: '$235/day',
      description: 'Prehistoric adventure with dual slides and dinosaur-themed bounce area.',
      dimensions: '24\' x 20\' x 18\'',
      ageRange: 'Ages 4-14',
      capacity: 'Up to 12 kids',
      image: '/images/placeholders/dinosaur-xl-dual-lane-combo.jpg',
      category: 'combo',
      popular: true,
      location: 'Angola'
    },
    {
      id: 10,
      name: 'Palm Tree Waterslide',
      price: '$210/day',
      description: 'Tropical-themed water slide with splash pool and palm tree features.',
      dimensions: '28\' x 15\' x 20\'',
      ageRange: 'Ages 5-16',
      capacity: 'Up to 10 kids',
      image: '/images/placeholders/palm-tree-waterslide.jpg',
      category: 'slide',
      popular: true,
      location: 'Angola'
    }
  ];

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

  const filteredRentals = rentalItems.filter(item => 
    activeFilter === 'all' || item.category === activeFilter
  );

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
          <button 
            className={`filter-btn ${activeFilter === 'combo' ? 'active' : ''}`}
            onClick={() => handleFilterClick('combo')}
          >
            Bounce House Combos
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'slide' ? 'active' : ''}`}
            onClick={() => handleFilterClick('slide')}
          >
            Water Slides
          </button>
        </div>
        <div className="featured-rentals-grid">
          {filteredRentals.map(item => (
            <div className="rental-card" key={item.id}>
              <div className="rental-image">
                <PlaceholderImage alt={item.name} />
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
