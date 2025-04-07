import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faStar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../../styles/testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: "RoweBros made my daughter's 8th birthday absolutely perfect! The castle bounce house was a hit, and their staff was so professional and friendly. Everything was set up on time and they made sure all the kids were safe while having fun.",
      author: "Sarah M.",
      location: "Elkhart, IN",
      image: "/images/testimonial1.jpg",
      stars: 5,
      event: "Birthday Party"
    },
    {
      id: 2,
      text: "We rented the water slide for our neighborhood block party and it was amazing! Setup was quick, everything was clean, and the kids had a blast all day. The RoweBros team was incredibly helpful with suggestions for placement and safety.",
      author: "John D.",
      location: "Angola, IN",
      image: "/images/testimonial2.jpg",
      stars: 5,
      event: "Community Event"
    },
    {
      id: 3,
      text: "The Deluxe Party Package was worth every penny! Having the concessions included made planning so much easier, and the kids loved everything! I'll definitely be using RoweBros for all our future events.",
      author: "Lisa T.",
      location: "South Bend, IN",
      image: "/images/testimonial3.jpg",
      stars: 5,
      event: "School Celebration"
    }
  ];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">Don't just take our word for it - hear from families who've experienced the RoweBros difference</p>
        
        <div className="testimonial-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <FontAwesomeIcon icon={faQuoteLeft} className="testimonial-quote-icon" />
              <div className="testimonial-text">
                <p>{testimonial.text}</p>
              </div>
              <div className="testimonial-author">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="testimonial-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/60x60?text=" + testimonial.author.charAt(0);
                  }}
                />
                <div>
                  <h4 className="testimonial-name">{testimonial.author}</h4>
                  <p className="testimonial-location">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {testimonial.location}
                  </p>
                  <div className="testimonial-stars">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="testimonial-cta">
          <p className="testimonial-cta-text">Ready to create your own amazing event memories?</p>
          <a href="/rentals" className="testimonial-cta-button">Browse Rentals</a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
