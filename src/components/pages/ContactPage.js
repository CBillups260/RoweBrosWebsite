import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt, 
  faClock,
  faPaperPlane,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/pages.css';
import '../../styles/contact-us.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Thank you for contacting us! We will get back to you within 24 hours.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        message: ''
      });
    }, 1500);
  };
  
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We're here to help make your event perfect!</p>
      </div>
      
      <div className="page-content">
        <div className="contact-page-grid">
          <div className="contact-info-section">
            <h2>Get In Touch</h2>
            
            <div className="contact-info-card">
              <div className="contact-info-item">
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <h3>Call Us</h3>
                  <p><a href="tel:5743438522">(574) 343-8522</a></p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <h3>Email Us</h3>
                  <p><a href="mailto:info@rowebros.com">info@rowebros.com</a></p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <div>
                  <h3>Locations</h3>
                  <div className="locations">
                    <div className="location">
                      <p className="location-name">Angola</p>
                      <address>123 Main St, Angola, IN 46703</address>
                    </div>
                    <div className="location">
                      <p className="location-name">Elkhart</p>
                      <address>456 Park Ave, Elkhart, IN 46516</address>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="contact-info-item">
                <FontAwesomeIcon icon={faClock} />
                <div>
                  <h3>Business Hours</h3>
                  <p className="hours">
                    Monday-Friday: 9am - 6pm<br />
                    Saturday: 10am - 4pm<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="map-section">
              <h3>Find Us</h3>
              <div className="map-container">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47586.35724882784!2d-84.95551127234487!3d41.63476576055336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8815eba5a8ce27d3%3A0xfd9be9c940c4331d!2sAngola%2C%20IN%2046703!5e0!3m2!1sen!2sus!4v1649378647983!5m2!1sen!2sus" 
                  width="100%" 
                  height="300" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RoweBros Angola Location"
                ></iframe>
              </div>
            </div>
          </div>
          
          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            <p>Have questions about our rentals or need a custom quote? Fill out this form and we'll get back to you as soon as possible.</p>
            
            {formStatus.submitted ? (
              <div className="form-success">
                <FontAwesomeIcon icon={faCheckCircle} />
                <p>{formStatus.message}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name*</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address*</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number*</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="eventDate">Event Date (if applicable)</label>
                  <input 
                    type="date" 
                    id="eventDate" 
                    name="eventDate" 
                    value={formData.eventDate} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message*</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    value={formData.message} 
                    onChange={handleChange} 
                    required 
                  ></textarea>
                </div>
                
                <div className="form-submit">
                  <button type="submit" className="submit-button">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Send Message
                  </button>
                </div>
              </form>
            )}
            
            <div className="contact-policy">
              <p>By submitting this form, you agree to our <a href="/privacy">Privacy Policy</a> and consent to being contacted regarding your inquiry.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
