import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section id="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h2>MAKE YOUR NEXT<br />EVENT<br />UNFORGETTABLE!</h2>
          <p>From bounce houses to water slides, we have everything you need to create the perfect party experience for kids of all ages.</p>
          <div className="hero-cta">
            <Link to="/#featured-rentals" className="cta-button primary">EXPLORE OUR RENTALS</Link>
            <Link to="/#packages" className="cta-button secondary">VIEW PARTY PACKAGES</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="decoration star1"></div>
          <div className="decoration star2"></div>
          <div className="decoration star3"></div>
          <div className="decoration circle1"></div>
          <div className="decoration circle2"></div>
          <img src="/images/Hero Bounce House.png" alt="Colorful Bounce House" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
