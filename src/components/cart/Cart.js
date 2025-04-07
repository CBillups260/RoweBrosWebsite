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

  const handleRemoveItem = (id, date, e) => {
    // Prevent event from propagating up to parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Remove the item from cart
    removeFromCart(id, date);
  };

  const handleQuantityChange = (id, date, currentQuantity, change, e) => {
    // Prevent event from propagating up to parent elements
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, date, newQuantity);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
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
                <div key={`${item.id}-${item.date}-${index}`} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.mainImage || item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-content">
                    <div className="cart-item-details">
                      <h5>{item.name}</h5>
                      <p className="cart-item-price">{formatCurrency(item.priceNumeric * item.quantity)}</p>
                      <div className="cart-item-date">For: {formatDate(item.date)}</div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={(e) => handleQuantityChange(item.id, item.date, item.quantity, -1, e)}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={(e) => handleQuantityChange(item.id, item.date, item.quantity, 1, e)}
                          className="quantity-btn"
                          aria-label="Increase quantity"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      <button 
                        className="remove-item"
                        onClick={(e) => handleRemoveItem(item.id, item.date, e)}
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
