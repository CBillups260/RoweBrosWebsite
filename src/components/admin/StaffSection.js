import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch,
  faEnvelope,
  faPhone,
  faUserShield,
  faUserCog,
  faUser,
  faKey,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { 
  getStaffMembers, 
  updateStaffStatus, 
  resetStaffPassword,
  deleteStaffMember
} from '../../services/staffService';
import StaffForm from './StaffForm';

const StaffSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // Fetch staff members on component mount
  useEffect(() => {
    fetchStaffMembers();
  }, []);
  
  // Fetch staff from Firebase
  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const staffData = await getStaffMembers();
      setStaffMembers(staffData);
      setFilteredStaff(staffData);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff members:', err);
      setError('Failed to load staff members. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters
  useEffect(() => {
    let result = [...staffMembers];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(staff => 
        staff.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(staff => 
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStaff(result);
  }, [staffMembers, roleFilter, searchTerm]);
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <FontAwesomeIcon icon={faUserShield} />;
      case 'manager':
        return <FontAwesomeIcon icon={faUserCog} />;
      default:
        return <FontAwesomeIcon icon={faUser} />;
    }
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    return status?.toLowerCase() === 'active' ? 'status-active' : 'status-inactive';
  };
  
  // Handle adding new staff
  const handleAddStaff = () => {
    setCurrentStaff(null);
    setShowStaffForm(true);
  };
  
  // Handle editing staff
  const handleEditStaff = (staff) => {
    setCurrentStaff(staff);
    setShowStaffForm(true);
  };
  
  // Handle form submission
  const handleStaffFormSubmit = (updatedStaffMembers) => {
    setStaffMembers(updatedStaffMembers);
    setShowStaffForm(false);
    setCurrentStaff(null);
  };
  
  // Handle form cancel
  const handleStaffFormCancel = () => {
    setShowStaffForm(false);
    setCurrentStaff(null);
  };
  
  // Handle status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setProcessingId(id);
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await updateStaffStatus(id, newStatus);
      
      // Update local state
      setStaffMembers(staffMembers.map(staff => 
        staff.id === id ? { ...staff, status: newStatus } : staff
      ));
    } catch (err) {
      console.error('Error updating staff status:', err);
      alert('Failed to update staff status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async (email) => {
    if (!email) {
      alert('No email address available for this staff member.');
      return;
    }
    
    if (window.confirm(`Send password reset email to ${email}?`)) {
      try {
        setProcessingId(email);
        await resetStaffPassword(email);
        alert(`Password reset email sent to ${email}`);
      } catch (err) {
        console.error('Error sending password reset:', err);
        alert('Failed to send password reset email. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };
  
  // Handle staff deletion
  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        setProcessingId(id);
        await deleteStaffMember(id);
        
        // Update local state
        setStaffMembers(staffMembers.filter(staff => staff.id !== id));
        alert('Staff member deleted successfully');
      } catch (err) {
        console.error('Error deleting staff member:', err);
        alert('Failed to delete staff member. Please try again.');
      } finally {
        setProcessingId(null);
      }
    }
  };
  
  if (loading && staffMembers.length === 0) {
    return (
      <div className="dashboard-section staff-section">
        <div className="loading-indicator">Loading staff members...</div>
      </div>
    );
  }
  
  if (error && staffMembers.length === 0) {
    return (
      <div className="dashboard-section staff-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section staff-section">
      {showStaffForm ? (
        <StaffForm 
          staff={currentStaff} 
          onSubmit={handleStaffFormSubmit}
          onCancel={handleStaffFormCancel}
        />
      ) : (
        <>
          <div className="section-header">
            <h2>Staff Management</h2>
            <button className="primary-button" onClick={handleAddStaff}>
              <FontAwesomeIcon icon={faPlus} /> Add Staff Member
            </button>
          </div>
          
          <div className="filters-bar">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-box">
              <label>Role:</label>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value.toLowerCase())}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(staff => (
                    <tr key={staff.id}>
                      <td>{staff.id.substring(0, 8)}...</td>
                      <td>{staff.name || 'No name'}</td>
                      <td>
                        <div className="contact-info">
                          <div>
                            <FontAwesomeIcon icon={faEnvelope} /> {staff.email || 'No email'}
                          </div>
                          <div>
                            <FontAwesomeIcon icon={faPhone} /> {staff.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-badge">
                          {getRoleIcon(staff.role)} {staff.role || 'Staff'}
                        </div>
                      </td>
                      <td>{formatDate(staff.joinDate)}</td>
                      <td>
                        <span 
                          className={`staff-status ${getStatusClass(staff.status)} clickable`}
                          onClick={() => handleToggleStatus(staff.id, staff.status)}
                          title={`Click to mark as ${staff.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          {processingId === staff.id ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            staff.status || 'Unknown'
                          )}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="icon-button edit"
                          onClick={() => handleEditStaff(staff)}
                          title="Edit Staff Member"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="icon-button reset-password"
                          onClick={() => handleResetPassword(staff.email)}
                          disabled={!staff.email || processingId === staff.email}
                          title="Reset Password"
                        >
                          {processingId === staff.email ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            <FontAwesomeIcon icon={faKey} />
                          )}
                        </button>
                        <button 
                          className="icon-button delete"
                          onClick={() => handleDeleteStaff(staff.id)}
                          disabled={processingId === staff.id}
                          title="Delete Staff Member"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-table-message">
                      No staff members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredStaff.length === 0 && staffMembers.length > 0 && (
            <div className="empty-state">
              <p>No staff members found matching your search criteria.</p>
            </div>
          )}
          
          {staffMembers.length === 0 && !loading && (
            <div className="empty-state">
              <p>No staff members have been added yet. Click "Add Staff Member" to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StaffSection;
