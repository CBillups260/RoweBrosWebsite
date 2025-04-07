import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faPlus, faTrash, faCreditCard as faVisa, faCreditCard as faMastercard, faCreditCard as faAmex } from '@fortawesome/free-solid-svg-icons';

const PaymentMethodsSection = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      cardType: 'visa',
      cardNumber: '•••• •••• •••• 4242',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: 2,
      cardType: 'mastercard',
      cardNumber: '•••• •••• •••• 5555',
      expiryDate: '09/26',
      isDefault: false
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCard({
      ...newCard,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!newCard.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(newCard.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!newCard.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!newCard.expiryMonth) {
      newErrors.expiryMonth = 'Month is required';
    }
    
    if (!newCard.expiryYear) {
      newErrors.expiryYear = 'Year is required';
    }
    
    if (!newCard.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(newCard.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddCard = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Determine card type based on first digit
    let cardType = 'unknown';
    const firstDigit = newCard.cardNumber.charAt(0);
    if (firstDigit === '4') {
      cardType = 'visa';
    } else if (firstDigit === '5') {
      cardType = 'mastercard';
    } else if (firstDigit === '3') {
      cardType = 'amex';
    }
    
    // Format card number for display
    const lastFour = newCard.cardNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${lastFour}`;
    
    // Create new card object
    const newPaymentMethod = {
      id: Date.now(),
      cardType,
      cardNumber: maskedNumber,
      expiryDate: `${newCard.expiryMonth}/${newCard.expiryYear.slice(-2)}`,
      isDefault: newCard.isDefault
    };
    
    // If new card is default, update other cards
    let updatedMethods = [...paymentMethods];
    if (newCard.isDefault) {
      updatedMethods = updatedMethods.map(method => ({
        ...method,
        isDefault: false
      }));
    }
    
    // Add new card to payment methods
    setPaymentMethods([...updatedMethods, newPaymentMethod]);
    
    // Reset form
    setNewCard({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    });
    
    setShowAddForm(false);
  };
  
  const handleSetDefault = (id) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    
    setPaymentMethods(updatedMethods);
  };
  
  const handleDeleteCard = (id) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== id);
    
    // If we deleted the default card and there are other cards, make the first one default
    if (paymentMethods.find(method => method.id === id)?.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    
    setPaymentMethods(updatedMethods);
  };
  
  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'visa':
        return <FontAwesomeIcon icon={faVisa} />;
      case 'mastercard':
        return <FontAwesomeIcon icon={faMastercard} />;
      case 'amex':
        return <FontAwesomeIcon icon={faAmex} />;
      default:
        return <FontAwesomeIcon icon={faCreditCard} />;
    }
  };
  
  return (
    <div className="dashboard-section payment-methods-section">
      <div className="section-header">
        <h2>Payment Methods</h2>
        {!showAddForm && (
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Payment Method
          </button>
        )}
      </div>
      
      {paymentMethods.length > 0 ? (
        <div className="payment-methods-list">
          {paymentMethods.map(method => (
            <div key={method.id} className={`payment-method-card ${method.isDefault ? 'default' : ''}`}>
              <div className="card-icon">
                {getCardIcon(method.cardType)}
              </div>
              <div className="card-details">
                <div className="card-number">{method.cardNumber}</div>
                <div className="card-expiry">Expires: {method.expiryDate}</div>
                {method.isDefault && <div className="default-badge">Default</div>}
              </div>
              <div className="card-actions">
                {!method.isDefault && (
                  <button 
                    className="set-default-button"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteCard(method.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You don't have any saved payment methods.</p>
          {!showAddForm && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Payment Method
            </button>
          )}
        </div>
      )}
      
      {showAddForm && (
        <div className="add-payment-form">
          <h3>Add New Payment Method</h3>
          <form onSubmit={handleAddCard}>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={newCard.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && <div className="input-error">{errors.cardNumber}</div>}
            </div>
            
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={newCard.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
              {errors.cardholderName && <div className="input-error">{errors.cardholderName}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Expiration Date</label>
                <div className="expiry-inputs">
                  <select
                    name="expiryMonth"
                    value={newCard.expiryMonth}
                    onChange={handleInputChange}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <option key={month} value={month < 10 ? `0${month}` : month}>
                          {month < 10 ? `0${month}` : month}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    name="expiryYear"
                    value={newCard.expiryYear}
                    onChange={handleInputChange}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {(errors.expiryMonth || errors.expiryYear) && (
                  <div className="input-error">
                    {errors.expiryMonth || errors.expiryYear}
                  </div>
                )}
              </div>
              
              <div className="form-group half">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={newCard.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvv && <div className="input-error">{errors.cvv}</div>}
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="defaultCard"
                name="isDefault"
                checked={newCard.isDefault}
                onChange={handleInputChange}
              />
              <label htmlFor="defaultCard">Set as default payment method</label>
            </div>
            
            <div className="button-group">
              <button type="submit" className="save-button">
                Add Card
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;
