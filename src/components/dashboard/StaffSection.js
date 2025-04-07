import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch, 
  faUserShield, 
  faKey, 
  faToggleOn, 
  faToggleOff,
  faUserPlus,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { 
  getStaffMembers, 
  addStaffMember, 
  updateStaffMember, 
  deleteStaffMember, 
  resetStaffPassword,
  updateStaffStatus
} from '../../services/staffService';
import { 
  getRoles, 
  addRole, 
  updateRole, 
  deleteRole, 
  getAvailablePermissions 
} from '../../services/roleService';
import StaffForm from './StaffForm';
import RoleForm from './RoleForm';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/dashboard.css';

const StaffSection = () => {
  // Staff state
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [filteredStaff, setFilteredStaff] = useState([]);
  
  // Role state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  
  // Shared state
  const [activeTab, setActiveTab] = useState('staff');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Filter staff when search term changes
  useEffect(() => {
    if (staffSearchTerm.trim() === '') {
      setFilteredStaff(staffMembers);
    } else {
      const term = staffSearchTerm.toLowerCase();
      const filtered = staffMembers.filter(staff => 
        staff.name?.toLowerCase().includes(term) ||
        staff.email?.toLowerCase().includes(term) ||
        staff.role?.toLowerCase().includes(term)
      );
      setFilteredStaff(filtered);
    }
  }, [staffSearchTerm, staffMembers]);
  
  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch staff members
      const staffData = await getStaffMembers();
      setStaffMembers(staffData);
      setFilteredStaff(staffData);
      
      // Fetch roles
      const rolesData = await getRoles();
      setRoles(rolesData);
      
      // Fetch available permissions
      const permissionsData = await getAvailablePermissions();
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Staff CRUD operations
  const handleAddStaff = async (staffData) => {
    try {
      await addStaffMember(staffData);
      fetchData();
      setIsStaffFormOpen(false);
    } catch (err) {
      console.error('Error adding staff member:', err);
      setError(err.message || 'Failed to add staff member');
    }
  };
  
  const handleEditStaff = async (staffData) => {
    try {
      await updateStaffMember(selectedStaff.id, staffData);
      fetchData();
      setIsStaffFormOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      console.error('Error updating staff member:', err);
      setError(err.message || 'Failed to update staff member');
    }
  };
  
  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaffMember(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting staff member:', err);
        setError(err.message || 'Failed to delete staff member');
      }
    }
  };
  
  const handleResetPassword = async (email) => {
    if (window.confirm(`Send password reset email to ${email}?`)) {
      try {
        await resetStaffPassword(email);
        alert('Password reset email sent successfully');
      } catch (err) {
        console.error('Error sending password reset:', err);
        setError(err.message || 'Failed to send password reset');
      }
    }
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateStaffStatus(id, newStatus);
      fetchData();
    } catch (err) {
      console.error('Error updating staff status:', err);
      setError(err.message || 'Failed to update staff status');
    }
  };
  
  // Role CRUD operations
  const handleAddRole = async (roleData) => {
    try {
      await addRole(roleData);
      fetchData();
      setIsRoleFormOpen(false);
    } catch (err) {
      console.error('Error adding role:', err);
      setError(err.message || 'Failed to add role');
    }
  };
  
  const handleEditRole = async (roleData) => {
    try {
      await updateRole(selectedRole.id, roleData);
      fetchData();
      setIsRoleFormOpen(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role');
    }
  };
  
  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting role:', err);
        setError(err.message || 'Failed to delete role');
      }
    }
  };
  
  // UI helper functions
  const openAddStaffForm = () => {
    setSelectedStaff(null);
    setIsStaffFormOpen(true);
  };
  
  const openEditStaffForm = (staff) => {
    setSelectedStaff(staff);
    setIsStaffFormOpen(true);
  };
  
  const openAddRoleForm = () => {
    setSelectedRole(null);
    setIsRoleFormOpen(true);
  };
  
  const openEditRoleForm = (role) => {
    setSelectedRole(role);
    setIsRoleFormOpen(true);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="dashboard-section">
      <h2>Staff Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <FontAwesomeIcon icon={faUsers} /> Staff Members
        </button>
        <button 
          className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <FontAwesomeIcon icon={faUserShield} /> Roles & Permissions
        </button>
      </div>
      
      {activeTab === 'staff' && (
        <div className="staff-management">
          <div className="section-header">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-button" onClick={openAddStaffForm}>
              <FontAwesomeIcon icon={faUserPlus} /> Add Staff Member
            </button>
          </div>
          
          {filteredStaff.length === 0 ? (
            <p className="no-items">No staff members found.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(staff => (
                    <tr key={staff.id}>
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.role}</td>
                      <td>
                        <span className={`status-badge ${staff.status === 'Active' ? 'active' : 'inactive'}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td>{staff.joinDate ? staff.joinDate.toLocaleDateString() : 'N/A'}</td>
                      <td className="actions">
                        <button 
                          className="icon-button" 
                          onClick={() => openEditStaffForm(staff)}
                          title="Edit staff member"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handleResetPassword(staff.email)}
                          title="Reset password"
                        >
                          <FontAwesomeIcon icon={faKey} />
                        </button>
                        <button 
                          className="icon-button" 
                          onClick={() => handleToggleStatus(staff.id, staff.status)}
                          title={staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <FontAwesomeIcon icon={staff.status === 'Active' ? faToggleOn : faToggleOff} />
                        </button>
                        <button 
                          className="icon-button delete" 
                          onClick={() => handleDeleteStaff(staff.id)}
                          title="Delete staff member"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {isStaffFormOpen && (
            <StaffForm 
              staff={selectedStaff}
              roles={roles}
              onSubmit={selectedStaff ? handleEditStaff : handleAddStaff}
              onCancel={() => setIsStaffFormOpen(false)}
            />
          )}
        </div>
      )}
      
      {activeTab === 'roles' && (
        <div className="role-management">
          <div className="section-header">
            <h3>Roles & Permissions</h3>
            <button className="add-button" onClick={openAddRoleForm}>
              <FontAwesomeIcon icon={faPlus} /> Add Role
            </button>
          </div>
          
          {roles.length === 0 ? (
            <p className="no-items">No roles found.</p>
          ) : (
            <div className="roles-grid">
              {roles.map(role => (
                <div key={role.id} className="role-card">
                  <div className="role-header">
                    <h4>{role.name}</h4>
                    {role.isSystem && <span className="system-badge">System</span>}
                  </div>
                  <p className="role-description">{role.description}</p>
                  
                  <div className="permissions-count">
                    <span>{role.permissions?.length || 0} Permissions</span>
                  </div>
                  
                  <div className="role-actions">
                    <button 
                      className="icon-button" 
                      onClick={() => openEditRoleForm(role)}
                      disabled={role.isSystem}
                      title={role.isSystem ? "System roles cannot be edited" : "Edit role"}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="icon-button delete" 
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={role.isSystem}
                      title={role.isSystem ? "System roles cannot be deleted" : "Delete role"}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isRoleFormOpen && (
            <RoleForm 
              role={selectedRole}
              permissions={permissions}
              onSubmit={selectedRole ? handleEditRole : handleAddRole}
              onCancel={() => setIsRoleFormOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StaffSection;
