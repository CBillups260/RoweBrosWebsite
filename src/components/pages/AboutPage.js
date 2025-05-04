import React from 'react';
import '../../styles/pages.css';

const AboutPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>About RoweBros Party Rentals</h1>
      </div>
      
      <div className="page-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <div className="about-grid">
            <div className="about-text">
              <p>RoweBros Party Rentals was founded in 2023 by two brothers, Casey Rowe and Bobby Rowe, with a simple mission: to bring joy and excitement to parties and events throughout Indiana. What started as a small family business with just two bounce houses has grown into one of the region's premier party rental companies.</p>
              
              <p>Growing up in Indiana, the Rowe brothers always had a passion for bringing people together and creating memorable experiences. After noticing the lack of quality party rental options in the area, they decided to combine their entrepreneurial spirit with their love for celebrations.</p>
              
              <p>Today, RoweBros serves thousands of customers across multiple locations, but we still maintain the same family values and personal touch that we started with. Every rental, every delivery, and every customer interaction is handled with the same care and attention as if it were our own celebration.</p>
            </div>
            <div className="about-image">
              <img src="/images/founders.jpg" alt="The Rowe Brothers" className="founder-image" />
              <p className="image-caption">Casey and Bobby Rowe, Founders</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>At RoweBros Party Rentals, our mission is to transform ordinary gatherings into extraordinary memories. We believe that every celebration deserves special attention, high-quality equipment, and reliable service.</p>
          
          <div className="mission-values">
            <div className="value-card">
              <h3>Quality</h3>
              <p>We invest in premium, commercial-grade equipment that is regularly inspected and maintained to ensure safety and performance.</p>
            </div>
            <div className="value-card">
              <h3>Service</h3>
              <p>We're committed to exceptional customer service from the first quote to the final pickup. Our team is always available to answer questions and provide support.</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>We're proud to be part of the Indiana community and regularly participate in local events, fundraisers, and charity work.</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Our Team</h2>
          <p>Behind every successful rental is our dedicated team of professionals who work tirelessly to ensure everything runs smoothly.</p>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src="/images/founders.jpg" alt="Casey Rowe" />
              </div>
              <h3>Casey Rowe</h3>
              <p>Co-Founder</p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img src="/images/founders.jpg" alt="Bobby Rowe" />
              </div>
              <h3>Bobby Rowe</h3>
              <p>Co-Founder</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Serving Indiana with Pride</h2>
          <p>With locations in Angola and Elkhart, we're proud to serve communities throughout northern Indiana. Our service area includes:</p>
          
          <div className="locations-grid">
            <div className="location-area">
              <h4>Angola Region</h4>
              <ul>
                <li>Angola</li>
                <li>Fremont</li>
                <li>Hamilton</li>
                <li>Ashley</li>
                <li>Pleasant Lake</li>
                <li>Hudson</li>
              </ul>
            </div>
            <div className="location-area">
              <h4>Elkhart Region</h4>
              <ul>
                <li>Elkhart</li>
                <li>Goshen</li>
                <li>Middlebury</li>
                <li>Bristol</li>
                <li>Wakarusa</li>
                <li>Nappanee</li>
              </ul>
            </div>
            <div className="location-area">
              <h4>Additional Areas</h4>
              <ul>
                <li>Fort Wayne</li>
                <li>South Bend</li>
                <li>Warsaw</li>
                <li>Auburn</li>
                <li>Columbia City</li>
                <li>Kendallville</li>
              </ul>
            </div>
          </div>
          
          <p className="service-note">Not sure if we service your area? <a href="/contact">Contact us</a> to find out!</p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
