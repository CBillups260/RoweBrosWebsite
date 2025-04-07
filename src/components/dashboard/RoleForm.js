import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faCheck, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import '../../../src/styles/forms.css';

const RoleForm = ({ role, permissions, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (role) {
      setIsEditing(true);
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [role]);
  
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
  
  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions];
      
      if (newPermissions.includes(permissionId)) {
        // Remove permission if already selected
        return {
          ...prev,
          permissions: newPermissions.filter(id => id !== permissionId)
        };
      } else {
        // Add permission if not selected
        return {
          ...prev,
          permissions: [...newPermissions, permissionId]
        };
      }
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  // Group permissions by category
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const category = permission.id.split('_')[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faShieldAlt} />{' '}
            {isEditing ? 'Edit Role' : 'Add Role'}
          </h3>
          <button className="close-button" onClick={onCancel}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Role Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter role name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter role description"
              rows={3}
            />
          </div>
          
          <div className="form-group permissions-section">
            <label>Permissions</label>
            {errors.permissions && <div className="error-message">{errors.permissions}</div>}
            
            <div className="permissions-grid">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="permission-category">
                  <h4 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  
                  {categoryPermissions.map(permission => (
                    <div key={permission.id} className="permission-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                        />
                        <span className="permission-name">{permission.name}</span>
                      </label>
                      <p className="permission-description">{permission.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              <FontAwesomeIcon icon={faSave} /> {isEditing ? 'Update' : 'Add'} Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
