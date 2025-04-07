import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faTimes, 
  faSpinner,
  faUserShield,
  faUserCog,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { addStaffMember, updateStaffMember, getStaffMembers } from '../../services/staffService';

const StaffForm = ({ staff, onSubmit, onCancel }) => {
  const isEditMode = !!staff;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    status: 'Active',
    password: '',
    confirmPassword: '',
    permissions: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [permissionOptions] = useState([
    { id: 'manage_products', label: 'Manage Products' },
    { id: 'manage_categories', label: 'Manage Categories' },
    { id: 'manage_orders', label: 'Manage Orders' },
    { id: 'manage_staff', label: 'Manage Staff' },
    { id: 'view_sales', label: 'View Sales Data' },
    { id: 'manage_settings', label: 'Manage Settings' }
  ]);
  
  // Initialize form with staff data if in edit mode
  useEffect(() => {
    if (isEditMode && staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'Staff',
        status: staff.status || 'Active',
        password: '',
        confirmPassword: '',
        permissions: staff.permissions || []
      });
    }
  }, [isEditMode, staff]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const currentPermissions = [...prev.permissions];
      
      if (currentPermissions.includes(permissionId)) {
        return {
          ...prev,
          permissions: currentPermissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...currentPermissions, permissionId]
        };
      }
    });
  };
  
  // Validate form
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
    
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required for new staff';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for submission
      const staffData = { ...formData };
      
      // Don't send empty password in edit mode
      if (isEditMode && !staffData.password) {
        delete staffData.password;
      }
      
      // Always remove confirmPassword
      delete staffData.confirmPassword;
      
      if (isEditMode) {
        // Update existing staff
        await updateStaffMember(staff.id, staffData);
      } else {
        // Add new staff
        await addStaffMember(staffData);
      }
      
      // Get updated staff list and pass to parent
      const updatedStaffList = await getStaffMembers();
      onSubmit(updatedStaffList);
      
    } catch (err) {
      console.error('Error saving staff member:', err);
      setErrors({ submit: err.message || 'Failed to save staff member. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <FontAwesomeIcon icon={faUserShield} />;
      case 'manager':
        return <FontAwesomeIcon icon={faUserCog} />;
      default:
        return <FontAwesomeIcon icon={faUser} />;
    }
  };
  
  return (
    <div className="form-container staff-form">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="error-message form-error">{errors.submit}</div>
        )}
        
        <div className="form-group">
          <label htmlFor="name">Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            disabled={isEditMode} // Don't allow email change for existing users
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
          {isEditMode && (
            <div className="field-note">Email cannot be changed after creation.</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          
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
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{isEditMode ? 'New Password (leave blank to keep current)' : 'Password*'}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>
        
        <div className="form-group permissions-group">
          <label>Permissions</label>
          <div className="permissions-grid">
            {permissionOptions.map(permission => (
              <div key={permission.id} className="permission-checkbox">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={formData.permissions.includes(permission.id)}
                  onChange={() => handlePermissionChange(permission.id)}
                />
                <label htmlFor={`permission-${permission.id}`}>{permission.label}</label>
              </div>
            ))}
          </div>
          <div className="field-note">
            Note: Admin role automatically has all permissions regardless of selection.
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="secondary-button" 
            onClick={onCancel}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} /> {isEditMode ? 'Update Staff' : 'Add Staff'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
