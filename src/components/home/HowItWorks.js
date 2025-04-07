import React from 'react';

const HowItWorks = () => {
  return (
    <section id="how-it-works">
      <h3>Booking is Easy!</h3>
      <ol className="steps">
        <li>
          <span>1</span>
          <div className="step-icon"><i className="fas fa-search"></i></div>
          Browse our selection online.
        </li>
        <li>
          <span>2</span>
          <div className="step-icon"><i className="fas fa-calendar-check"></i></div>
          Check availability & book your date.
        </li>
        <li>
          <span>3</span>
          <div className="step-icon"><i className="fas fa-truck-loading"></i></div>
          We deliver, set up, and take down!
        </li>
        <li>
          <span>4</span>
          <div className="step-icon"><i className="fas fa-smile-beam"></i></div>
          Enjoy your amazing party!
        </li>
      </ol>
    </section>
  );
};

export default HowItWorks;
