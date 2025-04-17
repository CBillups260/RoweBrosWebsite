import React from 'react';
import bouncehouseImage from '../../assets/kids-jumping-in-bounce-house.png';
import './AboutSection.css';

const AboutSection = () => (
  <section id="about" className="about-section">
    <div className="container">
      <h2 className="section-title">About RoweBros</h2>
      <p className="section-subtitle">Family-owned party rental service since 2018</p>
      
      <div className="about-content">
        <div className="about-text">
          <p>
            At RoweBros Party Rentals, we bring the celebration to your doorstep.
            Family-owned and operated since 2018, we're committed to making
            affordable, high-quality party rentals accessible for every occasion.
          </p>
          <p>
            Our mission is simple: deliver clean, safe, and exciting entertainment
            options that create lasting memories for families across Northern Indiana.
            From backyard birthday parties to community events, we take pride in being
            part of your special moments.
          </p>
          <div className="about-cta">
            <a href="/about" className="cta-button">Learn More About Us</a>
          </div>
        </div>
        <div className="about-image">
          <img 
            src={bouncehouseImage}
            alt="Children enjoying a bounce house" 
            className="about-img"
          />
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
