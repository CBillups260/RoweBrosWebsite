import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import '../../styles/checkout-modal.css';

const CheckoutModal = ({ show, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedOption === 'customer' && !isAuthenticated) {
      // Redirect to login with a redirect back to checkout
      navigate('/login?redirect=/checkout');
    } else {
      // Proceed directly to checkout
      navigate('/checkout');
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h2>How would you like to checkout?</h2>
        
        <div className="checkout-options">
          <div 
            className={`checkout-option ${selectedOption === 'customer' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('customer')}
          >
            <div className="option-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="option-content">
              <h3>Checkout as a Customer</h3>
              <p>Faster checkout process. Your information will be saved for future rentals.</p>
            </div>
          </div>
          
          <div 
            className={`checkout-option ${selectedOption === 'guest' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('guest')}
          >
            <div className="option-icon">
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
            <div className="option-content">
              <h3>Continue as Guest</h3>
              <p>Quick checkout without creating an account.</p>
            </div>
          </div>
        </div>
        
        <button 
          className="continue-button"
          disabled={!selectedOption}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;
