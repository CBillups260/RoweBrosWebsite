import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faInstagram, 
  faTwitter,
  faTiktok
} from '@fortawesome/free-brands-svg-icons';
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer>
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="footer-column about-column">
              <img src="/images/logo.png" alt="RoweBros Party Rentals" className="footer-logo" />
              <p className="footer-tagline">We bring the party to you!</p>
              <p className="footer-description">Making parties unforgettable since 2018. Family-owned and operated in the greater Indiana area.</p>
              <div className="footer-social">
                <a href="https://facebook.com/rowebros" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="https://instagram.com/rowebros" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://twitter.com/rowebros" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="https://tiktok.com/@rowebros" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FontAwesomeIcon icon={faTiktok} />
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/#featured-rentals">Rentals</Link></li>
                <li><Link to="/#packages">Party Packages</Link></li>
                <li><Link to="/#faq">FAQ</Link></li>
                <li><Link to="/#contact-form">Contact</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Rental Categories</h4>
              <ul className="footer-links">
                <li><Link to="/rentals">All Rentals</Link></li>
                <li><Link to="/rentals#water">Water</Link></li>
                <li><Link to="/rentals#combo">Combo</Link></li>
                <li><Link to="/rentals#slide">Slide</Link></li>
                <li><Link to="/rentals#obstacle">Obstacle</Link></li>
              </ul>
            </div>
            
            <div className="footer-column contact-column">
              <h4>Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <p>Angola Location</p>
                    <address>15 Kodak Ln, Angola, IN 46703</address>
                  </div>
                </li>
                <li>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <div>
                    <p>Elkhart Location</p>
                    <address>56551 Mars Dr, Elkhart, IN 46516</address>
                  </div>
                </li>
                <li>
                  <FontAwesomeIcon icon={faPhone} />
                  <div>
                    <p>Call Us</p>
                    <a href="tel:5743438522">(574) 343-8522</a>
                  </div>
                </li>
                <li>
                  <FontAwesomeIcon icon={faEnvelope} />
                  <div>
                    <p>Email Us</p>
                    <a href="mailto:info@rowebros.com">info@rowebros.com</a>
                  </div>
                </li>
                <li>
                  <FontAwesomeIcon icon={faClock} />
                  <div>
                    <p>Business Hours</p>
                    <span>Mon-Fri: 9am-6pm, Sat: 9am-4pm</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} RoweBros Party Rentals. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/admin/login">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
