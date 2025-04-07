import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt, 
  faClock,
  faTruck,
  faShieldAlt,
  faSmile
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/contact-us.css';

const ContactUs = () => {
  return (
    <section className="contact-us-section" id="contact">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <h3>Call Us</h3>
            <p><a href="tel:5551234567">(555) 123-4567</a></p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h3>Email Us</h3>
            <p><a href="mailto:info@rowebrosrentals.com">info@rowebrosrentals.com</a></p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <h3>Visit Us</h3>
            <address>
              123 Party Lane<br />
              Funtown, CA 12345
            </address>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <h3>Business Hours</h3>
            <p className="hours">
              Monday-Friday: 9am - 6pm<br />
              Saturday: 10am - 4pm<br />
              Sunday: Closed
            </p>
          </div>
        </div>
        
        <div className="guarantees">
          <div className="guarantee-item">
            <FontAwesomeIcon icon={faTruck} />
            <span>Free Delivery</span>
          </div>
          <div className="guarantee-item">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Safety Certified</span>
          </div>
          <div className="guarantee-item">
            <FontAwesomeIcon icon={faSmile} />
            <span>100% Fun Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
