import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronUp, 
  faChevronDown,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/pages.css';
import '../../styles/faq.css';

const FaqPage = () => {
  const [activeFaqItem, setActiveFaqItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');
  
  const toggleFaq = (index) => {
    if (activeFaqItem === index) {
      setActiveFaqItem(null);
    } else {
      setActiveFaqItem(index);
    }
  };
  
  const changeCategory = (category) => {
    setActiveCategory(category);
    setActiveFaqItem(null);
  };
  
  // FAQ data by category
  const faqData = {
    general: [
      {
        question: "Does the price include set up and delivery?",
        answer: "Yes, although additional fees may apply for areas farther out. Remember prices do not include sales tax."
      },
      {
        question: "Does the standard 4 hour rental time include your set up time?",
        answer: "No. We arrive early to set up so you get the entire rental time to play."
      },
      {
        question: "Do we have to keep it plugged in the entire time?",
        answer: "Yes. A blower keeps air in the jump unit the entire time. Once unplugged they deflate. That's why we require an outlet within 50 feet of the unit or a generator. Longer cords can pop your circuit breaker so we bring our own heavy duty cords."
      },
      {
        question: "How big are the jumps?",
        answer: "Most of our jumps (all of our character jumps for example) are 15'x15' which is a little bigger than many companies rent. Please note the space required for each jump (listed near the large picture) as some are VERY big and require extra space. When in doubt, measure your space to make sure it will fit."
      },
      {
        question: "Do you deliver to other cities?",
        answer: "Yes, we deliver to most areas in northern Indiana. Some of the cities we service include Angola, Elkhart, Fort Wayne, South Bend, and surrounding communities. For areas outside our standard delivery zone, additional delivery fees may apply."
      }
    ],
    booking: [
      {
        question: "How do I reserve my rental equipment?",
        answer: "You can reserve your equipment through our website by selecting the items you want and adding them to your cart. You can also call us directly at (574) 343-8522 to make a reservation over the phone."
      },
      {
        question: "How far in advance should I book?",
        answer: "We recommend booking as early as possible, especially for weekend events during our busy season (May-September). Many popular items are booked 3-4 weeks in advance for weekend events."
      },
      {
        question: "Do you require a deposit?",
        answer: "Yes all orders require a $50 Credit Card deposit. The are fully refundable if you cancel your order at least 8 days prior to your rental date. If you cancel between 2-7 days prior to your rental you will be given a rain check that is good for 1 year."
      },
      {
        question: "What forms of payment do you accept?",
        answer: "We accept all major credit cards, cash, and business checks (with prior approval). The balance is due on the day of delivery before setup begins."
      },
      {
        question: "Can I modify my reservation after it's made?",
        answer: "Yes, you can modify your reservation up to 48 hours before your event, subject to availability. Please contact our office as soon as possible to make any changes."
      }
    ],
    setup: [
      {
        question: "What surfaces do you set up on?",
        answer: "We can set up on Grass (our favorite and best for the kids), dirt, asphalt, and concrete. Sorry, we can't set up on any type of rocks as the constant rubbing will wear through the vinyl jumps."
      },
      {
        question: "What if my yard is sloped?",
        answer: "The setup area needs to be relatively flat. Our equipment can accommodate a slight slope of up to 5 degrees, but anything steeper will require an alternative location. This is for safety reasons."
      },
      {
        question: "Do I need to provide anything for setup?",
        answer: "You need to provide access to a standard electrical outlet within 100 feet of the setup location. If no outlet is available, a generator can be rented from us for an additional fee. You should also ensure the area is clear of debris, pet waste, and obstacles."
      },
      {
        question: "What about the big jumps? Any special requirements?",
        answer: "Check the requirements listed with each jump. Also, make sure you have at least a 4 feet of access to the area where it will be set up. The jumps can weigh up to 650 pounds so we need a clear path with ample room."
      },
      {
        question: "Can inflatables be set up indoors?",
        answer: "Yes, many of our inflatables can be set up indoors provided there is adequate ceiling height (usually 12-15 feet minimum) and sufficient floor space. Please mention indoor setup when booking so we can ensure the equipment is compatible with your venue."
      }
    ],
    weather: [
      {
        question: "What happens if it rains on my rental day?",
        answer: "If it rains on your rental day, you have a few options: 1) We can set up under a covered area if available, 2) You can reschedule to another available date within 30 days, or 3) You can receive a rain check valid for one year. We monitor weather forecasts closely and will contact you if severe weather is expected."
      },
      {
        question: "What if the weather is too hot?",
        answer: "Our inflatables are designed to withstand hot weather, but for your guests' comfort, we recommend setting up in shaded areas on extremely hot days. For water slides and water-based inflatables, hot weather is actually ideal!"
      },
      {
        question: "Can you set up in windy conditions?",
        answer: "For safety reasons, we cannot set up if winds exceed 15-20 mph. If high winds are forecast, we'll work with you to reschedule or provide alternative options."
      },
      {
        question: "Do you rent in winter months?",
        answer: "Yes, we offer rentals year-round. For winter events, we recommend indoor venues. Some of our equipment is specifically designed for indoor use during cold weather months."
      }
    ],
    safety: [
      {
        question: "Are your inflatables safe?",
        answer: "Yes, all our inflatables meet strict safety standards. We only carry commercial-grade equipment that is inspected before and after each rental. Additionally, our staff is trained in proper setup and safety procedures."
      },
      {
        question: "Do you provide supervision during the rental?",
        answer: "No, we do not provide attendants to supervise the equipment during your event. It is the renter's responsibility to ensure proper supervision and adherence to safety rules. We do provide comprehensive safety instructions upon delivery."
      },
      {
        question: "What is the weight limit for your inflatables?",
        answer: "Weight limits vary by equipment. Most standard bounce houses can accommodate children and adults up to 200 pounds per person, with a total capacity of 800-1000 pounds. Specific weight limits are listed on each product page and will be reviewed during setup."
      },
      {
        question: "Are we responsible for the unit if it gets a tear or damaged in any way?",
        answer: "Yes and no. You are not responsible for normal wear and tear on our units. Seams may develop tears in high traffic areas over a period of time. If this happens please alert us at once so we can remedy the situation. If however, damage occurs due to failure to follow our safety rules or negligence (i.e. not turning off the blower in high winds) you will be responsible for all damages up to and including replacement of the unit/blower etc which can cost thousands of dollars."
      },
      {
        question: "Can we see a copy of your contract and safety rules?",
        answer: "Yes. There is a link in your receipt once you've ordered or you may contact our office. We also provide a complete safety briefing during setup."
      }
    ]
  };
  
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about our party rentals</p>
      </div>
      
      <div className="page-content">
        <div className="faq-page-container">
          <div className="faq-categories">
            <button 
              className={`category-button ${activeCategory === 'general' ? 'active' : ''}`}
              onClick={() => changeCategory('general')}
            >
              General Questions
            </button>
            <button 
              className={`category-button ${activeCategory === 'booking' ? 'active' : ''}`}
              onClick={() => changeCategory('booking')}
            >
              Booking & Reservations
            </button>
            <button 
              className={`category-button ${activeCategory === 'setup' ? 'active' : ''}`}
              onClick={() => changeCategory('setup')}
            >
              Setup & Requirements
            </button>
            <button 
              className={`category-button ${activeCategory === 'weather' ? 'active' : ''}`}
              onClick={() => changeCategory('weather')}
            >
              Weather Concerns
            </button>
            <button 
              className={`category-button ${activeCategory === 'safety' ? 'active' : ''}`}
              onClick={() => changeCategory('safety')}
            >
              Safety & Liability
            </button>
          </div>
          
          <div className="faq-content">
            <div className="faq-category-title">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <h2>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Questions</h2>
            </div>
            
            <div className="faq-list">
              {faqData[activeCategory].map((faq, index) => (
                <div 
                  key={index} 
                  className={`faq-item ${activeFaqItem === index ? 'active' : ''}`}
                >
                  <div className="faq-question" onClick={() => toggleFaq(index)}>
                    <h3>{faq.question}</h3>
                    <FontAwesomeIcon 
                      icon={activeFaqItem === index ? faChevronUp : faChevronDown} 
                      className="faq-icon"
                    />
                  </div>
                  <div 
                    className="faq-answer"
                    style={{ display: activeFaqItem === index ? 'block' : 'none' }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="faq-contact-info">
          <h3>Still have questions?</h3>
          <p>If you couldn't find the answer to your question, please don't hesitate to contact us!</p>
          <div className="faq-contact-buttons">
            <a href="/contact" className="contact-button">Contact Us</a>
            <a href="tel:5743438522" className="phone-button">(574) 343-8522</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
