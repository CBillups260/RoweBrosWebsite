import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../styles/packages.css';

const PartyPackages = () => {
  const packages = [
    {
      id: 1,
      name: 'Basic Birthday',
      price: '$299',
      features: [
        { text: 'Standard Bounce House (4 hours)', included: true },
        { text: 'Table & 10 Chairs', included: true },
        { text: 'Basic Party Supplies', included: true },
        { text: 'Setup & Takedown', included: true },
        { text: 'Concessions', included: false },
        { text: 'Party Host', included: false }
      ],
      featured: false
    },
    {
      id: 2,
      name: 'Deluxe Party',
      price: '$499',
      features: [
        { text: 'Premium Bounce House (4 hours)', included: true },
        { text: '2 Tables & 20 Chairs', included: true },
        { text: 'Deluxe Party Supplies', included: true },
        { text: 'Popcorn Machine', included: true },
        { text: 'Cotton Candy Machine', included: true },
        { text: 'Setup & Takedown', included: true }
      ],
      featured: true
    },
    {
      id: 3,
      name: 'Ultimate Celebration',
      price: '$799',
      features: [
        { text: 'Bounce House & Water Slide Combo (6 hours)', included: true },
        { text: '3 Tables & 30 Chairs', included: true },
        { text: 'Premium Party Supplies', included: true },
        { text: 'All Concessions Included', included: true },
        { text: 'Party Host & Assistant', included: true },
        { text: 'Party Games & Activities', included: true }
      ],
      featured: false
    }
  ];

  return (
    <section id="packages">
      <h3>Party Packages</h3>
      <p className="section-subtitle">Complete solutions for your special event</p>
      <div className="packages-container">
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            className={`package-card ${pkg.featured ? 'featured' : ''}`}
          >
            {pkg.featured && <div className="package-badge">Most Popular</div>}
            <div className="package-header">
              <h4>{pkg.name}</h4>
              <p className="package-price">{pkg.price}</p>
            </div>
            <div className="package-body">
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}>
                    <FontAwesomeIcon 
                      icon={feature.included ? faCheck : faTimes} 
                    />
                    {feature.text}
                  </li>
                ))}
              </ul>
              <a href="#booking-calendar" className="package-button">Book This Package</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartyPackages;
