import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faHome, faBuilding, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const AddressesSection = () => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch addresses from Firestore
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');
        const snapshot = await getDocs(addressesRef);
        
        if (snapshot.empty) {
          setAddresses([]);
          setIsLoading(false);
          return;
        }
        
        const addressData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAddresses(addressData);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setErrorMessage('Failed to load your addresses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAddresses();
  }, [currentUser]);
  
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
    
    // Clear success/error messages when form is modified
    setSuccessMessage('');
    setErrorMessage('');
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
    } else if (formData.state.length !== 2) {
      newErrors.state = 'Please use 2-letter state code';
    }
    
    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be in format 12345 or 12345-6789';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!currentUser?.uid) {
      setErrorMessage('You must be logged in to add addresses');
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // If new address is default, update other addresses in Firestore
      if (formData.isDefault) {
        for (const address of addresses) {
          if (address.isDefault) {
            const addressRef = doc(db, 'users', currentUser.uid, 'addresses', address.id);
            await setDoc(addressRef, { isDefault: false }, { merge: true });
          }
        }
      }
      
      // Create new address document
      const newAddressRef = doc(collection(db, 'users', currentUser.uid, 'addresses'));
      const newAddress = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(newAddressRef, newAddress);
      
      // Update local state
      const addressWithId = {
        id: newAddressRef.id,
        ...formData
      };
      
      // Update other addresses if new one is default
      let updatedAddresses = [...addresses];
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(address => ({
          ...address,
          isDefault: false
        }));
      }
      
      setAddresses([...updatedAddresses, addressWithId]);
      setSuccessMessage('Address added successfully!');
      
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
    } catch (error) {
      console.error('Error adding address:', error);
      setErrorMessage('Failed to add address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditAddress = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!currentUser?.uid || !editingAddress) {
      setErrorMessage('You must be logged in to edit addresses');
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // If edited address is becoming default, update other addresses in Firestore
      if (formData.isDefault && !editingAddress.isDefault) {
        for (const address of addresses) {
          if (address.isDefault && address.id !== editingAddress.id) {
            const addressRef = doc(db, 'users', currentUser.uid, 'addresses', address.id);
            await setDoc(addressRef, { isDefault: false }, { merge: true });
          }
        }
      }
      
      // Update address in Firestore
      const addressRef = doc(db, 'users', currentUser.uid, 'addresses', editingAddress.id);
      await setDoc(addressRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      const newAddresses = addresses.map(address => 
        address.id === editingAddress.id 
          ? { ...address, ...formData } 
          : formData.isDefault ? { ...address, isDefault: false } : address
      );
      
      setAddresses(newAddresses);
      setSuccessMessage('Address updated successfully!');
      
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
    } catch (error) {
      console.error('Error updating address:', error);
      setErrorMessage('Failed to update address. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
    setSuccessMessage('');
    setErrorMessage('');
  };
  
  const handleDeleteAddress = async (id) => {
    if (!currentUser?.uid) {
      setErrorMessage('You must be logged in to delete addresses');
      return;
    }
    
    const addressToDelete = addresses.find(address => address.id === id);
    if (!addressToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete the address "${addressToDelete.name}"?`)) {
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Delete from Firestore
      const addressRef = doc(db, 'users', currentUser.uid, 'addresses', id);
      await deleteDoc(addressRef);
      
      // If deleted address was default, set another address as default
      if (addressToDelete.isDefault && addresses.length > 1) {
        const newDefaultAddress = addresses.find(address => address.id !== id);
        if (newDefaultAddress) {
          const newDefaultRef = doc(db, 'users', currentUser.uid, 'addresses', newDefaultAddress.id);
          await setDoc(newDefaultRef, { isDefault: true }, { merge: true });
          
          // Update local state
          setAddresses(prevAddresses => 
            prevAddresses
              .filter(address => address.id !== id)
              .map(address => 
                address.id === newDefaultAddress.id 
                  ? { ...address, isDefault: true } 
                  : address
              )
          );
        }
      } else {
        // Just remove the address from local state
        setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== id));
      }
      
      setSuccessMessage('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      setErrorMessage('Failed to delete address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSetDefault = async (id) => {
    if (!currentUser?.uid) {
      setErrorMessage('You must be logged in to update addresses');
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // Update Firestore - set all addresses to non-default
      for (const address of addresses) {
        const addressRef = doc(db, 'users', currentUser.uid, 'addresses', address.id);
        await setDoc(addressRef, { 
          isDefault: address.id === id,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      // Update local state
      const newAddresses = addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      }));
      
      setAddresses(newAddresses);
      setSuccessMessage('Default address updated!');
    } catch (error) {
      console.error('Error setting default address:', error);
      setErrorMessage('Failed to update default address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const cancelForm = () => {
    if (editingAddress) {
      setEditingAddress(null);
    } else {
      setShowAddForm(false);
    }
    
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
    setSuccessMessage('');
    setErrorMessage('');
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
            <FontAwesomeIcon icon={faPlus} /> Add New Address
          </button>
        )}
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading your addresses...
        </div>
      ) : addresses.length === 0 && !showAddForm ? (
        <div className="empty-state">
          <p>You don't have any saved addresses yet.</p>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="addresses-list">
          {!showAddForm && !editingAddress && addresses.map(address => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              <div className="address-header">
                <div className="address-name">
                  {getAddressIcon(address.type)} {address.name}
                  {address.isDefault && (
                    <span className="default-badge">
                      <FontAwesomeIcon icon={faCheck} /> Default
                    </span>
                  )}
                </div>
                <div className="address-actions">
                  <button 
                    className="edit-button"
                    onClick={() => startEditAddress(address)}
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <div className="address-details">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
              </div>
              {!address.isDefault && (
                <button 
                  className="default-button"
                  onClick={() => handleSetDefault(address.id)}
                  disabled={isSaving}
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {(showAddForm || editingAddress) && (
        <div className="address-form-container">
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
                disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                disabled={isSaving}
              />
              <label htmlFor="defaultAddress">Set as default address</label>
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="save-button"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> {editingAddress ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingAddress ? 'Update Address' : 'Add Address'
                )}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={cancelForm}
                disabled={isSaving}
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
