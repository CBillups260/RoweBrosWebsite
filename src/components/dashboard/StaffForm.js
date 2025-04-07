import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUserShield } from '@fortawesome/free-solid-svg-icons';
import '../../../src/styles/forms.css';

const StaffForm = ({ staff, roles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    password: '',
    status: 'Active'
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (staff) {
      setIsEditing(true);
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        roleId: staff.roleId || '',
        status: staff.status || 'Active',
        // Don't include password in edit mode
        password: ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        roleId: '',
        password: '',
        status: 'Active'
      });
    }
  }, [staff]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'Password is required for new staff members';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Get the role name from the selected roleId
      const selectedRole = roles.find(role => role.id === formData.roleId);
      const roleName = selectedRole ? selectedRole.name : '';
      
      // Prepare data for submission
      const staffData = {
        ...formData,
        role: roleName, // Include both roleId and role name
        // Only include password if it's provided (for new staff or password changes)
        ...(formData.password ? { password: formData.password } : {})
      };
      
      onSubmit(staffData);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
          <button className="close-button" onClick={onCancel}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              disabled={isEditing} // Can't change email for existing staff
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
            {isEditing && <div className="field-note">Email cannot be changed</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone (optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roleId">Role</label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && <div className="error-message">{errors.roleId}</div>}
          </div>
          
          {!isEditing && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
          )}
          
          {isEditing && (
            <div className="form-group">
              <label htmlFor="password">New Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              <FontAwesomeIcon icon={faSave} /> {isEditing ? 'Update' : 'Add'} Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
