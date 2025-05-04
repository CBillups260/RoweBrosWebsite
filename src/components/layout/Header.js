import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faChevronDown, 
  faShoppingCart, 
  faTimes, 
  faBars,
  faUser,
  faSignOutAlt,
  faUserCog,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Cart from '../cart/Cart';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [locationDropdownActive, setLocationDropdownActive] = useState(false);
  const [cartDropdownActive, setCartDropdownActive] = useState(false);
  const [userDropdownActive, setUserDropdownActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Angola');
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const { cart } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleLocationDropdown = (e) => {
    e.stopPropagation();
    setLocationDropdownActive(!locationDropdownActive);
    if (cartDropdownActive) setCartDropdownActive(false);
    if (userDropdownActive) setUserDropdownActive(false);
  };

  const toggleCartDropdown = (e) => {
    if (e) e.stopPropagation();
    setCartDropdownActive(!cartDropdownActive);
    if (locationDropdownActive) setLocationDropdownActive(false);
    if (userDropdownActive) setUserDropdownActive(false);
    if (mobileMenuActive) setMobileMenuActive(false);
    
    // Add pulse animation to cart icon
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.classList.add('animate');
      setTimeout(() => {
        cartCount.classList.remove('animate');
      }, 300);
    }
    
    // Log for debugging
    console.log('Cart toggled, isOpen:', !cartDropdownActive);
  };

  const toggleUserDropdown = (e) => {
    if (e) e.stopPropagation();
    setUserDropdownActive(!userDropdownActive);
    if (locationDropdownActive) setLocationDropdownActive(false);
    if (cartDropdownActive) setCartDropdownActive(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
    // Prevent body scrolling when mobile menu is open
    if (!mobileMenuActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  useEffect(() => {
    // Reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuActive) {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuActive]);

  const changeLocation = (locationName) => {
    setCurrentLocation(locationName);
    setLocationDropdownActive(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setUserDropdownActive(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownActive && !e.target.closest('.location-dropdown')) {
        setLocationDropdownActive(false);
      }
      if (cartDropdownActive && !e.target.closest('.cart-icon-container') && !e.target.closest('.cart-dropdown')) {
        setCartDropdownActive(false);
      }
      if (userDropdownActive && !e.target.closest('.user-dropdown-container')) {
        setUserDropdownActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [locationDropdownActive, cartDropdownActive, userDropdownActive]);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <img src="/images/logo.png" alt="RoweBros Party Rentals Logo" className="logo" />
          </Link>
          <div className="motto">We bring the party to you!</div>
        </div>
        
        {/* Mobile Motto - Only visible on mobile */}
        <div className="mobile-motto">We bring the party to you!</div>
        
        {/* Mobile actions container */}
        <div className="mobile-actions">
          {/* Cart icon for mobile */}
          <div className="mobile-cart-icon" onClick={toggleCartDropdown}>
            <div className="cart-icon" aria-label="Open shopping cart">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cart.itemCount > 0 && (
                <span className="cart-count">{cart.itemCount}</span>
              )}
            </div>
          </div>
          
          {/* Mobile menu toggle button */}
          <div className="mobile-menu-button" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={mobileMenuActive ? faTimes : faBars} />
          </div>
        </div>
        
        {/* Mobile Menu Backdrop */}
        <div className={`mobile-menu-backdrop ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}></div>
        
        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <div className="logo-container">
              <Link to="/" onClick={() => setMobileMenuActive(false)}>
                <img src="/images/logo.png" alt="RoweBros Party Rentals Logo" className="logo" />
              </Link>
            </div>
            <button className="close-menu" onClick={toggleMobileMenu}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="mobile-menu-content">
            <div className="mobile-menu-location">
              <div className="location-header">Current Location</div>
              <div className="selected-location">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <div className="location-details">
                  <span className="location-name">{currentLocation}</span>
                  <span className="location-address">
                    {currentLocation === 'Angola' ? '15 Kodak Ln, Angola, IN 46703' : '56551 Mars Dr, Elkhart, IN 46516'}
                  </span>
                </div>
              </div>
              <div className="location-options">
                <a 
                  href="#" 
                  className={`location-option ${currentLocation === 'Angola' ? 'active' : ''}`}
                  onClick={() => { changeLocation('Angola'); setMobileMenuActive(false); }}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div className="location-details">
                    <span className="location-name">Angola</span>
                    <span className="location-address">15 Kodak Ln, Angola, IN 46703</span>
                  </div>
                </a>
                <a 
                  href="#" 
                  className={`location-option ${currentLocation === 'Elkhart' ? 'active' : ''}`}
                  onClick={() => { changeLocation('Elkhart'); setMobileMenuActive(false); }}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div className="location-details">
                    <span className="location-name">Elkhart</span>
                    <span className="location-address">56551 Mars Dr, Elkhart, IN 46516</span>
                  </div>
                </a>
              </div>
            </div>
            
            <ul className="mobile-menu-nav">
              <li>
                <Link to="/" onClick={() => setMobileMenuActive(false)}>Home</Link>
              </li>
              <li>
                <Link to="/rentals" onClick={() => setMobileMenuActive(false)}>Rentals</Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMobileMenuActive(false)}>About Us</Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMobileMenuActive(false)}>Contact</Link>
              </li>
              <li>
                <Link to="/faq" onClick={() => setMobileMenuActive(false)}>FAQ</Link>
              </li>
            </ul>
            
            <div className="mobile-menu-actions">
              <Link to="/rentals" className="button primary" onClick={() => setMobileMenuActive(false)}>
                Start Your Order <FontAwesomeIcon icon={faShoppingCart} />
              </Link>
              
              {isAuthenticated ? (
                <div className="mobile-user-options">
                  <Link to="/dashboard" className="button secondary" onClick={() => setMobileMenuActive(false)}>
                    My Dashboard <FontAwesomeIcon icon={faUser} />
                  </Link>
                  <button className="button secondary" onClick={() => { handleLogout(); setMobileMenuActive(false); }}>
                    Logout <FontAwesomeIcon icon={faSignOutAlt} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="button secondary" onClick={() => setMobileMenuActive(false)}>
                  Login / Register <FontAwesomeIcon icon={faUser} />
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <nav>
          <ul className={mobileMenuActive ? 'active' : ''}>
            <li className="mobile-menu-close">
              <button onClick={toggleMobileMenu}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </li>
            <li className={`location-dropdown ${locationDropdownActive ? 'active' : ''}`}>
              <div className="location-button" onClick={toggleLocationDropdown}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{currentLocation}</span>
                <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
                
                {locationDropdownActive && (
                  <div className="location-menu">
                    <div className="location-header">Choose Your Location</div>
                    <a 
                      href="#" 
                      className={`location-option ${currentLocation === 'Angola' ? 'active' : ''}`}
                      onClick={() => changeLocation('Angola')}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <div className="location-details">
                        <span className="location-name">Angola</span>
                        <span className="location-address">15 Kodak Ln, Angola, IN 46703</span>
                      </div>
                    </a>
                    <a 
                      href="#" 
                      className={`location-option ${currentLocation === 'Elkhart' ? 'active' : ''}`}
                      onClick={() => { changeLocation('Elkhart'); setMobileMenuActive(false); }}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <div className="location-details">
                        <span className="location-name">Elkhart</span>
                        <span className="location-address">56551 Mars Dr, Elkhart, IN 46516</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </li>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/rentals">Rentals</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/rentals" className="nav-button">
                Start Your Order <FontAwesomeIcon icon={faShoppingCart} />
              </Link>
            </li>
            <li>
              {isAuthenticated ? (
                <div className={`user-dropdown-container ${userDropdownActive ? 'user-dropdown-active' : ''}`}>
                  <div className="login-button user-button" onClick={toggleUserDropdown}>
                    <FontAwesomeIcon icon={faUser} />
                    {userDropdownActive && (
                      <div className="user-dropdown location-menu">
                        <div className="location-header">Your Account</div>
                        <div className="user-profile-info">
                          {currentUser.displayName && (
                            <p className="user-name">{currentUser.displayName}</p>
                          )}
                          <p className="user-email">{currentUser.email}</p>
                        </div>
                        <div className="location-options">
                          <Link 
                            to="/dashboard" 
                            className="location-option"
                            onClick={() => setUserDropdownActive(false)}
                          >
                            <FontAwesomeIcon icon={faUser} />
                            <div className="location-details">
                              <span className="location-name">My Dashboard</span>
                              <span className="location-address">Manage your account</span>
                            </div>
                          </Link>
                          <Link 
                            to="/dashboard" 
                            className="location-option"
                            onClick={() => setUserDropdownActive(false)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <div className="location-details">
                              <span className="location-name">Edit Profile</span>
                              <span className="location-address">Update your information</span>
                            </div>
                          </Link>
                          <button 
                            className="location-option"
                            onClick={handleLogout}
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <div className="location-details">
                              <span className="location-name">Logout</span>
                              <span className="location-address">Sign out of your account</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link to="/login" className="login-button" onClick={() => setMobileMenuActive(false)}>
                  <FontAwesomeIcon icon={faUser} />
                </Link>
              )}
            </li>
            <li className="desktop-cart-icon cart-icon-container">
              <div className="cart-icon" onClick={toggleCartDropdown} aria-label="Open shopping cart">
                <FontAwesomeIcon icon={faShoppingCart} />
                {cart.itemCount > 0 && (
                  <span className="cart-count">{cart.itemCount}</span>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Cart component moved outside the header container to ensure it's always accessible */}
      <Cart isOpen={cartDropdownActive} toggleCart={toggleCartDropdown} />
    </header>
  );
};

export default Header;
