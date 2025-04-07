import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRuler, 
  faChild, 
  faUsers, 
  faWeight, 
  faBolt, 
  faTruck,
  faCalendarAlt,
  faArrowLeft,
  faShoppingCart,
  faStar,
  faCheck,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import PlaceholderImage from '../common/PlaceholderImage';
import { getProductById } from '../../services/productService';
import { getProducts } from '../../services/productService';
import { getCategoryById } from '../../services/categoryService';
import '../../styles/rental-detail.css';

const RentalDetailPage = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [relatedRentals, setRelatedRentals] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const { addToCart } = useCart();

  // Fetch product details from Firebase
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Get product details
        const productData = await getProductById(id);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        // Format the product data for UI
        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          price: `$${productData.price}/day`,
          description: productData.description,
          dimensions: productData.dimensions || '',
          ageRange: productData.ageRange || '',
          capacity: productData.capacity || '',
          images: productData.images || [],
          categoryId: productData.categoryId,
          popular: productData.popular || false,
          location: productData.location || 'Elkhart',
          details: {
            description: productData.description,
            features: productData.features || [],
            safety: [
              `Suitable for ${productData.ageRange || 'children'}`,
              `Maximum capacity: ${productData.capacity || 'varies'}`,
              'Adult supervision required at all times',
              'No shoes, sharp objects, or food inside',
              'Not to be used in rain or high winds'
            ]
          },
          reviews: productData.reviews || []
        };
        
        setRental(formattedProduct);
        
        // Get category information
        if (productData.categoryId) {
          const categoryData = await getCategoryById(productData.categoryId);
          setCategory(categoryData);
        }
        
        // Fetch related products (same category)
        const allProducts = await getProducts();
        const related = allProducts
          .filter(product => 
            product.id !== id && 
            product.categoryId === productData.categoryId
          )
          .slice(0, 3)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: `$${product.price}/day`,
            image: product.images && product.images.length > 0 ? product.images[0].url : '',
            description: product.description
          }));
        
        setRelatedRentals(related);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleAddToCart = () => {
    if (!selectedDate) {
      alert('Please select a rental date before adding to cart');
      return;
    }
    
    // Format the rental item properly before adding to cart
    const rentalItem = {
      id: rental.id,
      name: rental.name,
      price: rental.price,
      mainImage: rental.images && rental.images.length > 0 ? rental.images[0].url : '',
      category: category ? category.name : '',
      location: rental.location
    };
    
    addToCart(rentalItem, selectedDate);
    setAddedToCart(true);
    
    // Reset added to cart message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading rental information...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="rental-not-found">
        <h2>Rental Not Found</h2>
        <p>Sorry, we couldn't find the rental you're looking for.</p>
        <Link to="/rentals" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Rentals
        </Link>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = rental.reviews ? rental.reviews.reduce((acc, review) => acc + review.rating, 0) / rental.reviews.length : 0;

  return (
    <div className="rental-detail-page">
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> &gt; 
          <Link to="/rentals">Rentals</Link> &gt; 
          <span>{rental.name}</span>
        </div>
      </div>
      
      <div className="rental-detail-container container">
        <div className="back-link-mobile">
          <Link to="/rentals" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Rentals
          </Link>
        </div>
        
        <div className="rental-detail-grid">
          <div className="rental-images">
            <div className="main-image">
              <PlaceholderImage alt={rental.name} />
            </div>
            <div className="thumbnail-images">
              {rental.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image.url} alt={`${rental.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="rental-info">
            <h1>{rental.name}</h1>
            
            <div className="rental-meta">
              <div className="rental-price">{rental.price}</div>
              <div className="rental-rating">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon 
                    key={i} 
                    icon={faStar} 
                    className={i < Math.round(averageRating) ? 'filled' : ''} 
                  />
                ))}
                <span>({rental.reviews ? rental.reviews.length : 0} reviews)</span>
              </div>
            </div>
            
            <div className="rental-quick-info">
              <div className="info-item">
                <FontAwesomeIcon icon={faRuler} />
                <span>{rental.dimensions}</span>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faChild} />
                <span>{rental.ageRange}</span>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faUsers} />
                <span>{rental.capacity}</span>
              </div>
            </div>
            
            <p className="rental-description">{rental.details.description}</p>
            
            <div className="rental-booking">
              <div className="date-selection">
                <label htmlFor="rental-date">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Select Date:
                </label>
                <input 
                  type="date" 
                  id="rental-date" 
                  value={selectedDate} 
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button 
                className="add-to-cart-button" 
                onClick={handleAddToCart}
                disabled={addedToCart}
              >
                {addedToCart ? (
                  <span>
                    <FontAwesomeIcon icon={faCheck} /> Added to Cart
                  </span>
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                  </span>
                )}
              </button>
            </div>
            
            <div className="rental-note">
              <FontAwesomeIcon icon={faInfoCircle} />
              <p>Price includes delivery, setup, and takedown within 20 miles of our location. Additional fees may apply for longer distances.</p>
            </div>
          </div>
        </div>
        
        <div className="rental-tabs">
          <div className="tab-buttons">
            <button 
              className={activeTab === 'description' ? 'active' : ''} 
              onClick={() => handleTabChange('description')}
            >
              Features & Specs
            </button>
            <button 
              className={activeTab === 'safety' ? 'active' : ''} 
              onClick={() => handleTabChange('safety')}
            >
              Safety Information
            </button>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''} 
              onClick={() => handleTabChange('reviews')}
            >
              Reviews ({rental.reviews ? rental.reviews.length : 0})
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-description">
                <div className="features-list">
                  <h3>Features</h3>
                  <ul>
                    {rental.details.features.map((feature, index) => (
                      <li key={index}>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="specs-list">
                  <h3>Specifications</h3>
                  <div className="specs-grid">
                    {/* Add specs array to rental items */}
                    {/* {rental.specs.map((spec, index) => (
                      <div key={index} className="spec-item">
                        <FontAwesomeIcon icon={spec.icon} />
                        <span>{spec.text}</span>
                      </div>
                    ))} */}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'safety' && (
              <div className="tab-safety">
                <h3>Safety Guidelines</h3>
                <p>For the safety of all participants, please follow these important guidelines:</p>
                <ul className="safety-list">
                  {rental.details.safety.map((item, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={faCheck} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="tab-reviews">
                <div className="reviews-summary">
                  <div className="average-rating">
                    <div className="rating-number">{averageRating.toFixed(1)}</div>
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon 
                          key={i} 
                          icon={faStar} 
                          className={i < Math.round(averageRating) ? 'filled' : ''} 
                        />
                      ))}
                      <span>({rental.reviews ? rental.reviews.length : 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="reviews-list">
                  {rental.reviews ? rental.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-name">{review.name}</div>
                        <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon 
                            key={i} 
                            icon={faStar} 
                            className={i < review.rating ? 'filled' : ''} 
                          />
                        ))}
                      </div>
                      <div className="review-comment">{review.comment}</div>
                    </div>
                  )) : <p>No reviews yet.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="related-rentals">
          <h2>You May Also Like</h2>
          <div className="related-rentals-grid">
            {relatedRentals.map(item => (
              <div key={item.id} className="related-rental-item">
                <div className="related-rental-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <h3>{item.name}</h3>
                <p className="related-rental-price">{item.price}</p>
                <Link to={`/rentals/${item.id}`} className="view-details-button">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailPage;
