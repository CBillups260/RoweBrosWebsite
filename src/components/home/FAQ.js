import React, { useState, useEffect } from 'react';

const FAQ = () => {
  const [activeFaqItem, setActiveFaqItem] = useState(null);
  const [showHiddenFaqs, setShowHiddenFaqs] = useState(false);

  const toggleFaq = (index) => {
    if (activeFaqItem === index) {
      setActiveFaqItem(null);
    } else {
      setActiveFaqItem(index);
    }
  };

  const toggleHiddenFaqs = () => {
    setShowHiddenFaqs(!showHiddenFaqs);
  };

  // Add active class to FAQ item when clicked
  useEffect(() => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
      if (index === activeFaqItem) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }, [activeFaqItem]);

  return (
    <section id="faq">
      <h3>Frequently Asked Questions</h3>
      <div className="faq-container">
        {/* Initial visible FAQs */}
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(0)}>
            <h4>Does the price include set up and delivery?</h4>
            <i className={`fas fa-chevron-${activeFaqItem === 0 ? 'up' : 'down'}`}></i>
          </div>
          <div className="faq-answer" style={{ display: activeFaqItem === 0 ? 'block' : 'none' }}>
            <p>Yes, although additional fees may apply for areas farther out. Remember prices do not include sales tax.</p>
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(1)}>
            <h4>Does the standard 4 hour rental time include your set up time?</h4>
            <i className={`fas fa-chevron-${activeFaqItem === 1 ? 'up' : 'down'}`}></i>
          </div>
          <div className="faq-answer" style={{ display: activeFaqItem === 1 ? 'block' : 'none' }}>
            <p>No. We arrive early to set up so you get the entire rental time to play.</p>
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(2)}>
            <h4>Do we have to keep it plugged in the entire time?</h4>
            <i className={`fas fa-chevron-${activeFaqItem === 2 ? 'up' : 'down'}`}></i>
          </div>
          <div className="faq-answer" style={{ display: activeFaqItem === 2 ? 'block' : 'none' }}>
            <p>Yes. A blower keeps air in the jump unit the entire time. Once unplugged they deflate. That's why we require an outlet within 50 feet of the unit or a generator. Longer cords can pop your circuit breaker so we bring our own heavy duty cords.</p>
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(3)}>
            <h4>How big are the jumps?</h4>
            <i className={`fas fa-chevron-${activeFaqItem === 3 ? 'up' : 'down'}`}></i>
          </div>
          <div className="faq-answer" style={{ display: activeFaqItem === 3 ? 'block' : 'none' }}>
            <p>Most of our jumps (all of our character jumps for example) are 15'x15' which is a little bigger than many companies rent. Please note the space required for each jump (listed near the large picture) as some are VERY big and require extra space. When in doubt, measure your space to make sure it will fit.</p>
          </div>
        </div>
        
        <div className="show-more-container">
          <button id="show-more-faq" className="show-more-button" onClick={toggleHiddenFaqs}>
            <span>Show More FAQs</span>
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>
        
        {/* Hidden FAQs */}
        <div className="hidden-faqs" style={{ display: showHiddenFaqs ? 'block' : 'none' }}>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(4)}>
              <h4>Do you deliver to other cities?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 4 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 4 ? 'block' : 'none' }}>
              <p>Yes, but once again please be aware that due to rising gas prices and the possible need for an extra truck and labor that travel fees can be quite high. Please call our office for a current quote.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(5)}>
              <h4>When do you set up?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 5 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 5 ? 'block' : 'none' }}>
              <p>That depends on how many rentals we have that day. Generally we arrive 1-3 hours before the rental time begins. If we have a lot of rentals that day, we may need to set up as early as 4 hours in advance. If this is the case, we will call the Friday before to confirm that someone will be at the party location.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(6)}>
              <h4>We've rented some really dirty jumps from other companies in the past. Are they always that dirty?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 6 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 6 ? 'block' : 'none' }}>
              <p>No. The jump should be clean when you get it. Rowe Bros Party Rentals cleans and disinfects after every rental.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(7)}>
              <h4>What about parks? Do parks have electricity?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 7 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 7 ? 'block' : 'none' }}>
              <p>We love setting up at parks but most parks do NOT have electricity. If you want to set up at a park, you must rent a generator. We rent generators at a reasonable cost. Also, parks are first come, first serve so get your spot early in the day.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(8)}>
              <h4>What payments do you take?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 8 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 8 ? 'block' : 'none' }}>
              <p>Cash or Credit Cards. If paying by cash, please have exact change as our drivers do not carry cash.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(9)}>
              <h4>What if we need to cancel?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 9 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 9 ? 'block' : 'none' }}>
              <p>Please check out our policies page for details.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(10)}>
              <h4>Do you require a deposit?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 10 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 10 ? 'block' : 'none' }}>
              <p>Yes all orders require a $50 Credit Card deposit. The are fully refundable if you cancel your order at least 8 days prior to your rental date. If you cancel between 2-7 days prior to your rental you will be given a rain check that is good for 1 year.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(11)}>
              <h4>What about the big jumps? Any special requirements?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 11 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 11 ? 'block' : 'none' }}>
              <p>Check the requirements listed with each jump. Also, make sure you have at least a 4 feet of access to the area where it will be set up. The jumps can weigh up to 650 pounds so we need a clear path with ample room.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(12)}>
              <h4>What surfaces do you set up on?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 12 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 12 ? 'block' : 'none' }}>
              <p>We can set up on Grass (our favorite and best for the kids), dirt, asphalt, and concrete. Sorry, we can't set up on any type of rocks as the constant rubbing will wear through the vinyl jumps.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(13)}>
              <h4>Can we see a copy of your contract and safety rules?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 13 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 13 ? 'block' : 'none' }}>
              <p>Yes. There is a link in your receipt once you've ordered or you may contact our office.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(14)}>
              <h4>Are we responsible for the unit if it gets a tear or damaged in any way?</h4>
              <i className={`fas fa-chevron-${activeFaqItem === 14 ? 'up' : 'down'}`}></i>
            </div>
            <div className="faq-answer" style={{ display: activeFaqItem === 14 ? 'block' : 'none' }}>
              <p>Yes and no. You are not responsible for normal wear and tear on our units. Seams may develop tears in high traffic areas over a period of time. If this happens please alert us at once so we can remedy the situation. If however, damage occurs due to failure to follow our safety rules or negligence (i.e. not turning off the blower in high winds) you will be responsible for all damages up to and including replacement of the unit/blower etc which can cost thousands of dollars. We don't want you or us to be in that situation which is why we have you sign and initial on all of our safety rules so that you can be the trained operator.</p>
            </div>
          </div>
          
          <div className="show-less-container">
            <button id="show-less-faq" className="show-less-button" onClick={toggleHiddenFaqs}>
              <span>Show Less</span>
              <i className="fas fa-chevron-up"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
