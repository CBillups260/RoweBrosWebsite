import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faTrash, 
  faPlus, 
  faMinus,
  faArrowLeft,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import CheckoutModal from '../checkout/CheckoutModal';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  const handleRemoveItem = (id, date) => {
    removeFromCart(id, date);
  };
  
  const handleQuantityChange = (id, date, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, date, newQuantity);
    }
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const openCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
  };
  
  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };
  
  if (cart.items.length === 0) {
    return (
      <div className="empty-cart-page">
        <FontAwesomeIcon icon={faShoppingCart} />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet. Browse our selection of bounce houses, water slides, and obstacle courses to find the perfect addition to your next event!</p>
        <Link to="/rentals" className="shop-now-btn">Shop Now</Link>
      </div>
    );
  }
  
  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>Your Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</h1>
        <p>Review your items before proceeding to checkout</p>
      </div>
      
      <div className="cart-page-content">
        <div className="cart-items-container">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item, index) => (
                <tr key={`${item.id}-${item.date}-${index}`}>
                  <td>
                    <div className="cart-product">
                      <img src={item.mainImage || item.image} alt={item.name} />
                      <div className="cart-product-details">
                        <h3>{item.name}</h3>
                        <p>Rental Date: {formatDate(item.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td>{formatCurrency(item.priceNumeric)}</td>
                  <td>
                    <div className="cart-quantity">
                      <button 
                        className="cart-quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.date, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="cart-quantity-value">{item.quantity}</span>
                      <button 
                        className="cart-quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.date, item.quantity, 1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </td>
                  <td className="cart-item-total">{formatCurrency(item.priceNumeric * item.quantity)}</td>
                  <td>
                    <button 
                      className="cart-remove-btn"
                      onClick={() => handleRemoveItem(item.id, item.date)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
          </div>
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
          
          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span>$50.00</span>
          </div>
          
          <div className="summary-row">
            <span>Tax:</span>
            <span>{formatCurrency(cart.total * 0.07)}</span>
          </div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span className="value">{formatCurrency(cart.total + 50 + (cart.total * 0.07))}</span>
          </div>
          
          <button className="checkout-btn" onClick={openCheckoutModal}>
            <FontAwesomeIcon icon={faCheck} /> Proceed to Checkout
          </button>
          
          <Link to="/rentals" className="continue-shopping">
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
          </Link>
        </div>
      </div>
      
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={closeCheckoutModal} />
    </div>
  );
};

export default CartPage;
