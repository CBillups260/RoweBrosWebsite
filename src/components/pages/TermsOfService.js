import React from 'react';
import '../../styles/pages.css';

const TermsOfService = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Terms of Service</h1>
        <p className="page-update">Last Updated: April 5, 2025</p>
      </div>
      
      <div className="page-content policy-content">
        <section className="policy-section">
          <h2>1. Agreement to Terms</h2>
          <p>These Terms of Service ("Terms") constitute a legally binding agreement between you and RoweBros Party Rentals ("we," "our," or "us") governing your access to and use of our website, services, and rentals.</p>
          <p>By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not access or use our services.</p>
        </section>
        
        <section className="policy-section">
          <h2>2. Rental Services</h2>
          
          <h3>2.1 Rental Reservations</h3>
          <p>When you make a reservation through our website or by phone, you are creating a legally binding offer to rent equipment subject to these Terms. All reservations are subject to availability and our acceptance.</p>
          
          <h3>2.2 Rental Period</h3>
          <p>The rental period begins when the equipment is delivered or picked up and ends when the equipment is picked up by us or returned by you, as specified in your rental agreement. Additional fees will apply for late returns.</p>
          
          <h3>2.3 Rental Fees and Payments</h3>
          <p>All prices are quoted in US dollars and do not include applicable taxes. A deposit is required to confirm your reservation. Final payment is due before or upon delivery unless other arrangements have been made. We accept major credit cards, cash, and other payment methods as specified on our website.</p>
          
          <h3>2.4 Cancellations and Refunds</h3>
          <p>Cancellation policies vary by rental type and timeframe:</p>
          <ul>
            <li>Cancellations made 14+ days before the event: Full refund of deposit</li>
            <li>Cancellations made 7-13 days before the event: 50% refund of deposit</li>
            <li>Cancellations made less than 7 days before the event: No refund</li>
          </ul>
          <p>Weather-related cancellations are handled case-by-case. We reserve the right to cancel rentals due to unsafe conditions, in which case a full refund will be provided.</p>
        </section>
        
        <section className="policy-section">
          <h2>3. User Responsibilities</h2>
          
          <h3>3.1 Safe Use and Operation</h3>
          <p>You agree to:</p>
          <ul>
            <li>Use the equipment properly and for its intended purpose</li>
            <li>Follow all safety instructions provided</li>
            <li>Provide adult supervision for all inflatable equipment at all times</li>
            <li>Not allow food, drink, shoes, eyeglasses, or sharp objects in inflatable equipment</li>
            <li>Not move equipment once it has been set up by our staff</li>
          </ul>
          
          <h3>3.2 Site Requirements</h3>
          <p>You are responsible for:</p>
          <ul>
            <li>Providing adequate space for equipment setup (dimensions provided upon reservation)</li>
            <li>Ensuring a flat, clean surface for installation</li>
            <li>Identifying and marking underground utilities before delivery</li>
            <li>Providing access to electrical outlets (within 100 feet) for inflatable equipment</li>
            <li>Obtaining necessary permits if required by your location</li>
          </ul>
          
          <h3>3.3 Liability for Damage</h3>
          <p>You are responsible for all damage to rental equipment beyond normal wear and tear. This includes tears, punctures, water damage, excessive soiling, or damage from improper use. Repair or replacement costs will be charged to your payment method on file.</p>
        </section>
        
        <section className="policy-section">
          <h2>4. Our Responsibilities</h2>
          
          <h3>4.1 Delivery and Setup</h3>
          <p>We will deliver, set up, and pick up equipment at the times specified in your rental agreement. Our delivery window is typically 1-3 hours before your event start time, depending on scheduling.</p>
          
          <h3>4.2 Equipment Quality</h3>
          <p>We guarantee that all equipment is thoroughly inspected, cleaned, and sanitized before each rental. All inflatables are commercial grade and meet safety standards.</p>
          
          <h3>4.3 Safety Instructions</h3>
          <p>We will provide clear safety instructions for all equipment. For inflatable rentals, our staff will provide a brief safety orientation upon delivery.</p>
        </section>
        
        <section className="policy-section">
          <h2>5. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, RoweBros Party Rentals, its officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to personal injuries, property damage, loss of use, or loss of income or profits.</p>
          <p>You agree to indemnify and hold harmless RoweBros Party Rentals from any claims, damages, liabilities, and expenses arising from your use of our equipment or breach of these Terms.</p>
        </section>
        
        <section className="policy-section">
          <h2>6. Website Use</h2>
          
          <h3>6.1 Account Registration</h3>
          <p>To access certain features of our website, you may need to register for an account. You agree to provide accurate information and keep your account credentials secure. You are responsible for all activities that occur under your account.</p>
          
          <h3>6.2 Intellectual Property</h3>
          <p>All content on our website, including text, graphics, logos, images, and software, is the property of RoweBros Party Rentals and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.</p>
          
          <h3>6.3 Prohibited Conduct</h3>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Engage in any fraudulent activity</li>
          </ul>
        </section>
        
        <section className="policy-section">
          <h2>7. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. The updated version will be indicated by an updated "Last Updated" date. Your continued use of our services after any changes indicates your acceptance of the modified Terms.</p>
        </section>
        
        <section className="policy-section">
          <h2>8. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of the State of Indiana, without regard to its conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts of Steuben County, Indiana.</p>
        </section>
        
        <section className="policy-section">
          <h2>9. Contact Information</h2>
          <p>If you have questions about these Terms, please contact us at:</p>
          <p>
            RoweBros Party Rentals<br />
            123 Main St, Angola, IN 46703<br />
            Email: info@rowebros.com<br />
            Phone: (574) 343-8522
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
