import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faTimes, 
  faTrash,
  faPlus,
  faMinus,
  faArrowRight,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import '../../styles/cart.css';

const Cart = ({ isOpen, toggleCart }) => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const cartRef = useRef(null);

  // Handle clicking outside the cart to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target) && 
          !event.target.closest('.cart-icon') && isOpen) {
        toggleCart();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleCart]);

  // Prevent scrolling on body when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cart-open');
    } else {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('cart-open');
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('cart-open');
    };
  }, [isOpen]);

  const handleRemoveItem = (id, bookingId, e) => {
    // Prevent event from propagating up to parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Remove the item from cart
    removeFromCart(id, bookingId);
  };

  const handleQuantityChange = (id, bookingId, currentQuantity, change, e) => {
    // Prevent event from propagating up to parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, bookingId, newQuantity);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Handle both Date objects and strings
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Use UTC methods to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    // Ensure amount is a number and is positive
    const value = typeof amount === 'number' ? Math.abs(amount) : 0;
    return `$${value.toFixed(2)}`;
  };

  return (
    <>
      {/* Cart backdrop */}
      <div 
        className={`cart-backdrop ${isOpen ? 'active' : ''}`} 
        onClick={toggleCart}
        data-testid="cart-backdrop"
      ></div>
      
      {/* Cart drawer */}
      <div 
        className={`cart-drawer ${isOpen ? 'active' : ''}`} 
        ref={cartRef}
        data-testid="cart-drawer"
      >
        <div className="cart-header">
          <h4>
            <FontAwesomeIcon icon={faShoppingBag} className="cart-header-icon" />
            Your Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
          </h4>
          <button className="close-cart" onClick={toggleCart}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon-container">
              <FontAwesomeIcon icon={faShoppingCart} className="empty-cart-icon" />
            </div>
            <p>Your cart is empty</p>
            <Link to="/rentals" className="browse-rentals-btn" onClick={toggleCart}>
              Browse Rentals
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${item.bookingId}-${index}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.mainImage || item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-content">
                    <div className="cart-item-details">
                      <h5>{item.name}</h5>
                      <p className="cart-item-price">{formatCurrency(item.priceNumeric * item.quantity)}</p>
                      <div className="cart-item-booking">
                        <div className="cart-item-date">Date: {formatDate(item.date)}</div>
                        <div className="cart-item-time">Time: {item.time}</div>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={(e) => handleQuantityChange(item.id, item.bookingId, item.quantity, -1, e)}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={(e) => handleQuantityChange(item.id, item.bookingId, item.quantity, 1, e)}
                          className="quantity-btn"
                          aria-label="Increase quantity"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      <button 
                        className="remove-item"
                        onClick={(e) => handleRemoveItem(item.id, item.bookingId, e)}
                        aria-label="Remove item"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <span className="cart-subtotal-amount">{formatCurrency(cart.total)}</span>
              </div>
              <div className="cart-shipping">
                <span>Shipping & Delivery:</span>
                <span>Free</span>
              </div>
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">{formatCurrency(cart.total)}</span>
              </div>
              <div className="cart-buttons">
                <Link to="/checkout" className="checkout-button" onClick={toggleCart}>
                  Checkout <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link to="/cart" className="view-cart-button" onClick={toggleCart}>
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
