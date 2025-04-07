import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryProductCount
} from '../../services/categoryService';

const CategoriesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productCounts, setProductCounts] = useState({});
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Fetch product counts for each category
        const counts = {};
        for (const category of categoriesData) {
          counts[category.id] = await getCategoryProductCount(category.id);
        }
        setProductCounts(counts);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle editing a category
  const handleEdit = (category) => {
    setEditingCategory({ ...category });
  };
  
  // Handle saving edited category
  const handleSave = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        await updateCategory(editingCategory.id, {
          name: editingCategory.name,
          description: editingCategory.description
        });
        
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? editingCategory : cat
        ));
        
        setEditingCategory(null);
      } catch (err) {
        console.error('Error updating category:', err);
        alert('Failed to update category. Please try again.');
      }
    }
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };
  
  // Handle adding new category
  const handleAddNew = () => {
    setIsAddingNew(true);
  };
  
  // Handle saving new category
  const handleSaveNew = async () => {
    if (newCategory.name.trim()) {
      try {
        const addedCategory = await addCategory({
          name: newCategory.name,
          description: newCategory.description
        });
        
        setCategories([...categories, addedCategory]);
        setProductCounts({
          ...productCounts,
          [addedCategory.id]: 0
        });
        
        setNewCategory({ name: '', description: '' });
        setIsAddingNew(false);
      } catch (err) {
        console.error('Error adding category:', err);
        alert('Failed to add category. Please try again.');
      }
    }
  };
  
  // Handle canceling new category
  const handleCancelNew = () => {
    setNewCategory({ name: '', description: '' });
    setIsAddingNew(false);
  };
  
  // Handle deleting a category
  const handleDelete = async (id) => {
    // Don't allow deletion if there are products in the category
    if (productCounts[id] > 0) {
      alert(`Cannot delete this category because it contains ${productCounts[id]} products. Please remove or reassign these products first.`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Failed to delete category. Please try again.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-section categories-section">
        <div className="loading-indicator">Loading categories...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-section categories-section">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-section categories-section">
      <div className="section-header">
        <h2>Categories Management</h2>
        <button className="primary-button" onClick={handleAddNew} disabled={isAddingNew}>
          <FontAwesomeIcon icon={faPlus} /> Add New Category
        </button>
      </div>
      
      <div className="filters-bar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAddingNew && (
              <tr className="new-row">
                <td>New</td>
                <td>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Category name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Category description"
                  />
                </td>
                <td>0</td>
                <td className="actions-cell">
                  <button className="icon-button save" onClick={handleSaveNew} title="Save">
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="icon-button cancel" onClick={handleCancelNew} title="Cancel">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </td>
              </tr>
            )}
            
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <tr key={category.id}>
                  <td>{category.id.substring(0, 8)}...</td>
                  <td>
                    {editingCategory && editingCategory.id === category.id ? (
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editingCategory && editingCategory.id === category.id ? (
                      <input
                        type="text"
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                      />
                    ) : (
                      category.description || '-'
                    )}
                  </td>
                  <td>{productCounts[category.id] || 0}</td>
                  <td className="actions-cell">
                    {editingCategory && editingCategory.id === category.id ? (
                      <>
                        <button className="icon-button save" onClick={handleSave} title="Save">
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button className="icon-button cancel" onClick={handleCancelEdit} title="Cancel">
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="icon-button edit" 
                          onClick={() => handleEdit(category)}
                          title="Edit Category"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="icon-button delete" 
                          onClick={() => handleDelete(category.id)}
                          disabled={productCounts[category.id] > 0}
                          title={productCounts[category.id] > 0 ? 
                            "Cannot delete category with products" : 
                            "Delete Category"}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table-message">
                  No categories found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {categories.length === 0 && !isAddingNew && (
        <div className="empty-state">
          <p>No categories found. Add a new category to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;
