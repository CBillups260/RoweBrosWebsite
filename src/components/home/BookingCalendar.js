import React, { useState, useEffect } from 'react';

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState('April 2025');
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);

  // Generate calendar days for April 2025
  useEffect(() => {
    generateCalendarDays();
  }, []);

  const generateCalendarDays = () => {
    // April 2025 starts on a Tuesday (index 2)
    const startingDayOfWeek = 2;
    const daysInMonth = 30;
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          {30 - startingDayOfWeek + i + 1}
        </div>
      );
    }
    
    // Sample availability data
    const availabilityData = {
      1: 'available', 2: 'available', 3: 'limited', 4: 'limited', 5: 'booked',
      6: 'booked', 7: 'available', 8: 'available', 9: 'available', 10: 'limited',
      11: 'limited', 12: 'booked', 13: 'booked', 14: 'available', 15: 'available',
      16: 'available', 17: 'limited', 18: 'limited', 19: 'booked', 20: 'booked',
      21: 'available', 22: 'available', 23: 'available', 24: 'limited', 25: 'limited',
      26: 'booked', 27: 'booked', 28: 'available', 29: 'available', 30: 'available'
    };
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `2025-04-${String(day).padStart(2, '0')}`;
      const availability = availabilityData[day] || 'available';
      const isToday = day === 15; // Just for demo purposes
      const isSelected = selectedDate === day;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${availability} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </div>
      );
    }
    
    // Add days from next month to fill out the grid
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day other-month">
          {i}
        </div>
      );
    }
    
    setCalendarDays(days);
  };
  
  const handleDateSelect = (day) => {
    setSelectedDate(day);
    document.getElementById('event-date').value = `April ${day}, 2025`;
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth('March 2025');
    // In a real app, you would load data for March
  };
  
  const handleNextMonth = () => {
    setCurrentMonth('May 2025');
    // In a real app, you would load data for May
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Checking availability for your selected date and options!');
  };
  
  return (
    <section id="booking-calendar">
      <h3>Book Your Party Today!</h3>
      <p className="section-subtitle">Check availability and reserve your date</p>
      <div className="booking-container">
        <div className="booking-content">
          <div className="calendar-container">
            <div className="calendar-header">
              <button id="prevMonth" className="month-nav" onClick={handlePrevMonth}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <h4 id="currentMonth">{currentMonth}</h4>
              <button id="nextMonth" className="month-nav" onClick={handleNextMonth}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="calendar-days" id="calendarDays">
              {calendarDays}
            </div>
            <div className="calendar-legend">
              <div className="legend-item"><span className="available"></span> Available</div>
              <div className="legend-item"><span className="limited"></span> Limited Availability</div>
              <div className="legend-item"><span className="booked"></span> Fully Booked</div>
            </div>
            <div className="popular-dates">
              <h5>Popular Party Dates</h5>
              <div className="popular-date-tags">
                <span className="date-tag">Apr 15 - School Break</span>
                <span className="date-tag">Apr 22 - Weekend Special</span>
                <span className="date-tag">May 5 - Holiday Weekend</span>
              </div>
            </div>
          </div>
          
          <div className="contact-booking-wrapper">
            <div className="booking-form">
              <h4>Quick Reservation</h4>
              <form id="quick-booking-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="event-date">Event Date</label>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar-alt"></i>
                    <input type="text" id="event-date" placeholder="Select a date" readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="event-type">Event Type</label>
                  <div className="input-with-icon">
                    <i className="fas fa-birthday-cake"></i>
                    <select id="event-type">
                      <option value="">Select event type</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="school">School Event</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="church">Church Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest-count">Number of Guests</label>
                    <div className="input-with-icon">
                      <i className="fas fa-users"></i>
                      <input type="number" id="guest-count" placeholder="# of guests" min="1" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="event-duration">Duration (hours)</label>
                    <div className="input-with-icon">
                      <i className="fas fa-clock"></i>
                      <select id="event-duration">
                        <option value="4">4 hours</option>
                        <option value="6">6 hours</option>
                        <option value="8">8 hours</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Rental Items</label>
                  <div className="rental-checkboxes">
                    <div className="rental-checkbox">
                      <input type="checkbox" id="bounce-house" name="rental-items" value="bounce-house" />
                      <label htmlFor="bounce-house">Bounce House</label>
                    </div>
                    <div className="rental-checkbox">
                      <input type="checkbox" id="water-slide" name="rental-items" value="water-slide" />
                      <label htmlFor="water-slide">Water Slide</label>
                    </div>
                    <div className="rental-checkbox">
                      <input type="checkbox" id="obstacle-course" name="rental-items" value="obstacle-course" />
                      <label htmlFor="obstacle-course">Obstacle Course</label>
                    </div>
                    <div className="rental-checkbox">
                      <input type="checkbox" id="party-package" name="rental-items" value="party-package" />
                      <label htmlFor="party-package">Party Package</label>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-info">Your Contact Info</label>
                  <div className="input-with-icon">
                    <i className="fas fa-envelope"></i>
                    <input type="email" id="contact-info" placeholder="Email or phone number" />
                  </div>
                </div>
                <button type="submit" className="booking-submit">Check Availability</button>
              </form>
            </div>
            
            <div className="contact-info">
              <h4>Contact Us</h4>
              <div className="contact-method">
                <i className="fas fa-phone"></i>
                <div>
                  <h5>Call Us</h5>
                  <p>(555) 123-4567</p>
                </div>
              </div>
              <div className="contact-method">
                <i className="fas fa-envelope"></i>
                <div>
                  <h5>Email Us</h5>
                  <p>info@rowebrosrentals.com</p>
                </div>
              </div>
              <div className="contact-method">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h5>Visit Us</h5>
                  <p>123 Party Lane<br />Funtown, CA 12345</p>
                </div>
              </div>
              <div className="contact-hours">
                <h5>Business Hours</h5>
                <p>Monday-Friday: 9am - 6pm<br />
                Saturday: 10am - 4pm<br />
                Sunday: Closed</p>
              </div>
              <div className="booking-benefits">
                <div className="benefit-item">
                  <i className="fas fa-truck"></i>
                  <span>Free Delivery</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Safety Certified</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-smile"></i>
                  <span>100% Fun Guaranteed</span>
                </div>
              </div>
              <div className="social-links">
                <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
