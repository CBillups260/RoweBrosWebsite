import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faHome, faBuilding, faCheck } from '@fortawesome/free-solid-svg-icons';

const AddressesSection = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'home',
      name: 'Home',
      street: '123 Main Street',
      city: 'Funtown',
      state: 'CA',
      zipCode: '12345',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      name: 'Office',
      street: '456 Business Ave',
      city: 'Funtown',
      state: 'CA',
      zipCode: '12345',
      isDefault: false
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
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
    
    if (!formData.name) {
      newErrors.name = 'Address name is required';
    }
    
    if (!formData.street) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be in format 12345 or 12345-6789';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddAddress = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // If new address is default, update other addresses
    let updatedAddresses = [...addresses];
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(address => ({
        ...address,
        isDefault: false
      }));
    }
    
    // Add new address
    const newAddress = {
      id: Date.now(),
      ...formData
    };
    
    setAddresses([...updatedAddresses, newAddress]);
    
    // Reset form
    setFormData({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    
    setShowAddForm(false);
  };
  
  const handleEditAddress = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // If edited address is default, update other addresses
    let updatedAddresses = [...addresses];
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(address => ({
        ...address,
        isDefault: address.id === editingAddress.id ? true : false
      }));
    }
    
    // Update the edited address
    const newAddresses = updatedAddresses.map(address => 
      address.id === editingAddress.id ? { ...address, ...formData } : address
    );
    
    setAddresses(newAddresses);
    
    // Reset form
    setFormData({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    
    setEditingAddress(null);
  };
  
  const startEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setShowAddForm(false);
  };
  
  const handleDeleteAddress = (id) => {
    const addressToDelete = addresses.find(address => address.id === id);
    const updatedAddresses = addresses.filter(address => address.id !== id);
    
    // If we deleted the default address and there are other addresses, make the first one default
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    setAddresses(updatedAddresses);
  };
  
  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    }));
    
    setAddresses(updatedAddresses);
  };
  
  const cancelForm = () => {
    setFormData({
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    setErrors({});
    setEditingAddress(null);
    setShowAddForm(false);
  };
  
  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <FontAwesomeIcon icon={faHome} />;
      case 'work':
        return <FontAwesomeIcon icon={faBuilding} />;
      default:
        return <FontAwesomeIcon icon={faHome} />;
    }
  };
  
  return (
    <div className="dashboard-section addresses-section">
      <div className="section-header">
        <h2>My Addresses</h2>
        {!showAddForm && !editingAddress && (
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Address
          </button>
        )}
      </div>
      
      {!showAddForm && !editingAddress && (
        <>
          {addresses.length > 0 ? (
            <div className="addresses-list">
              {addresses.map(address => (
                <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                  <div className="address-icon">
                    {getAddressIcon(address.type)}
                  </div>
                  <div className="address-details">
                    <div className="address-name">
                      {address.name}
                      {address.isDefault && (
                        <span className="default-badge">
                          <FontAwesomeIcon icon={faCheck} /> Default
                        </span>
                      )}
                    </div>
                    <div className="address-line">{address.street}</div>
                    <div className="address-line">{address.city}, {address.state} {address.zipCode}</div>
                  </div>
                  <div className="address-actions">
                    {!address.isDefault && (
                      <button 
                        className="set-default-button"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      className="edit-button"
                      onClick={() => startEditAddress(address)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You don't have any saved addresses.</p>
              <button 
                className="add-button"
                onClick={() => setShowAddForm(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Address
              </button>
            </div>
          )}
        </>
      )}
      
      {(showAddForm || editingAddress) && (
        <div className="address-form">
          <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={editingAddress ? handleEditAddress : handleAddAddress}>
            <div className="form-group">
              <label>Address Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Home, Work, etc."
              />
              {errors.name && <div className="input-error">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label>Address Type</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="typeHome"
                    name="type"
                    value="home"
                    checked={formData.type === 'home'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="typeHome">
                    <FontAwesomeIcon icon={faHome} /> Home
                  </label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="typeWork"
                    name="type"
                    value="work"
                    checked={formData.type === 'work'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="typeWork">
                    <FontAwesomeIcon icon={faBuilding} /> Work
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="123 Main St"
              />
              {errors.street && <div className="input-error">{errors.street}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
                {errors.city && <div className="input-error">{errors.city}</div>}
              </div>
              
              <div className="form-group small">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  maxLength="2"
                />
                {errors.state && <div className="input-error">{errors.state}</div>}
              </div>
              
              <div className="form-group small">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="12345"
                />
                {errors.zipCode && <div className="input-error">{errors.zipCode}</div>}
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="defaultAddress"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
              />
              <label htmlFor="defaultAddress">Set as default address</label>
            </div>
            
            <div className="button-group">
              <button type="submit" className="save-button">
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={cancelForm}
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

export default AddressesSection;
