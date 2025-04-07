import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faTruck, 
  faBoxOpen, 
  faHandshake,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/why-choose.css';

const WhyChooseUs = () => {
  const features = [
    {
      icon: faShieldAlt,
      title: 'Safe & Clean',
      description: 'All units are thoroughly cleaned and sanitized before every rental, meeting the highest safety standards.',
      benefits: [
        'Hospital-grade disinfectants used on all surfaces',
        'Regular safety inspections and maintenance',
        'Compliant with all safety regulations'
      ]
    },
    {
      icon: faTruck,
      title: 'Reliable Delivery',
      description: 'Professional, on-time delivery and setup service with text notifications when we are on our way.',
      benefits: [
        'Punctual arrival within your scheduled time window',
        'Expert setup by trained professionals',
        'Convenient pickup when your event ends'
      ]
    },
    {
      icon: faBoxOpen,
      title: 'Great Selection',
      description: 'A wide variety of inflatables and party essentials to make your event memorable and fun.',
      benefits: [
        'Latest bounce house designs and themes',
        'Options for all ages and event types',
        'Regularly updated inventory with new items'
      ]
    },
    {
      icon: faHandshake,
      title: 'Top Service',
      description: 'Friendly, helpful staff dedicated to making your event a success from start to finish.',
      benefits: [
        'Responsive customer support 7 days a week',
        'Personalized recommendations for your event',
        'Flexible booking and rescheduling options'
      ]
    }
  ];

  return (
    <section className="why-choose-section" id="why-choose-us">
      <div className="container">
        <h2 className="section-title">Why Choose RoweBros?</h2>
        <p className="section-subtitle">The trusted choice for bounce house and party rentals in Northern Indiana</p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-benefits">
                {feature.benefits.map((benefit, i) => (
                  <li key={i}>
                    <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="cta-container">
          <p className="cta-text">Ready to make your event unforgettable?</p>
          <a href="/rentals" className="cta-button">Browse Our Rentals</a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
