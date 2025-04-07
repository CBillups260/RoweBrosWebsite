import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faTimes, 
  faUpload, 
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { addProduct, updateProduct, getProducts, uploadProductImage } from '../../services/productService';

const ProductForm = ({ product, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    imagePath: '',
    featured: false,
    details: {
      size: '',
      color: '',
      material: '',
      condition: 'New'
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.categoryId || '',
        imageUrl: product.imageUrl || '',
        imagePath: product.imagePath || '',
        featured: product.featured || false,
        details: {
          size: product.details?.size || '',
          color: product.details?.color || '',
          material: product.details?.material || '',
          condition: product.details?.condition || 'New'
        }
      });
      
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    } else if (categories.length > 0) {
      // Set default category if adding new product
      setFormData(prev => ({
        ...prev,
        categoryId: categories[0].id
      }));
    }
  }, [product, categories]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (details)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Handle regular properties
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
    
    // Clear error for the field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)'
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: 'Image size should be less than 2MB'
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
    setErrors({
      ...errors,
      image: null
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    
    if (!product && !imageFile && !formData.imageUrl) {
      newErrors.image = 'Please upload a product image';
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
      
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };
      
      let updatedImageData = {};
      
      // Upload image if new file selected
      if (imageFile) {
        // If updating a product, use its ID, otherwise use a temporary ID
        const tempId = product ? product.id : `temp-${Date.now()}`;
        const imageData = await uploadProductImage(imageFile, tempId);
        
        updatedImageData = {
          imageUrl: imageData.url,
          imagePath: imageData.path
        };
      }
      
      let result;
      
      if (product) {
        // Update existing product
        result = await updateProduct(product.id, {
          ...productData,
          ...updatedImageData
        });
      } else {
        // Add new product
        result = await addProduct({
          ...productData,
          ...updatedImageData
        });
      }
      
      // Refresh products list
      const updatedProducts = await getProducts();
      
      // Call onSubmit with updated products
      onSubmit(updatedProducts);
      
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({
        ...errors,
        submit: 'Failed to save product. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="product-form-container">
      <div className="section-header">
        <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="header-actions">
          <button 
            className="secondary-button" 
            onClick={onCancel}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
          <button 
            className="primary-button" 
            onClick={handleSubmit}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} /> {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
      
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Product Name*</label>
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
            <label htmlFor="categoryId">Category*</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={errors.categoryId ? 'error' : ''}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($)*</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="stock">Stock Quantity*</label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className={errors.stock ? 'error' : ''}
            />
            {errors.stock && <div className="error-message">{errors.stock}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
          ></textarea>
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="details.size">Size</label>
            <input
              type="text"
              id="details.size"
              name="details.size"
              value={formData.details.size}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="details.color">Color</label>
            <input
              type="text"
              id="details.color"
              name="details.color"
              value={formData.details.color}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="details.material">Material</label>
            <input
              type="text"
              id="details.material"
              name="details.material"
              value={formData.details.material}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="details.condition">Condition</label>
            <select
              id="details.condition"
              name="details.condition"
              value={formData.details.condition}
              onChange={handleChange}
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            Featured Product
          </label>
        </div>
        
        <div className="form-group image-upload-group">
          <label>Product Image*</label>
          <div className="image-upload-container">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Product preview" />
              ) : (
                <div className="no-image">
                  <FontAwesomeIcon icon={faImage} />
                  <p>No image selected</p>
                </div>
              )}
            </div>
            <div className="image-upload-controls">
              <label className="upload-button" htmlFor="image-upload">
                <FontAwesomeIcon icon={faUpload} /> 
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <p className="image-help-text">
                Recommended size: 800x600px. Max size: 2MB.
              </p>
              {errors.image && <div className="error-message">{errors.image}</div>}
            </div>
          </div>
        </div>
        
        {errors.submit && (
          <div className="form-error-message">{errors.submit}</div>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
