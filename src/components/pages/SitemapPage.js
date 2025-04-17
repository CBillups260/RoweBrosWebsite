import React from 'react';
import { Link } from 'react-router-dom';

const SitemapPage = () => (
  <section className="sitemap-page container">
    <h1>Sitemap</h1>
    <ul className="sitemap-list">
      <li><Link to="/">Home</Link></li>
      <li><Link to="/rentals">Rentals</Link></li>
      <li><Link to="/rentals/bounce-houses">Bounce Houses</Link></li>
      <li><Link to="/rentals/water-slides">Water Slides</Link></li>
      <li><Link to="/rentals/obstacle-courses">Obstacle Courses</Link></li>
      <li><Link to="/rentals/combo-units">Combo Units</Link></li>
      <li><Link to="/rentals/concessions">Concessions</Link></li>
      <li><Link to="/rentals/tables-chairs">Tables & Chairs</Link></li>
      <li><Link to="/about">About Us</Link></li>
      <li><Link to="/faq">FAQ</Link></li>
      <li><Link to="/contact">Contact</Link></li>
      <li><Link to="/privacy">Privacy Policy</Link></li>
      <li><Link to="/terms">Terms of Service</Link></li>
      <li><Link to="/admin/login">Staff Login</Link></li>
    </ul>
  </section>
);

export default SitemapPage;
