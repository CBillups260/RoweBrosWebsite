import React from 'react';
import HeroSection from './HeroSection';
import FeaturedRentals from '../rentals/FeaturedRentals';
import AboutSection from './AboutSection';
import WhyChooseUs from './WhyChooseUs';
import Testimonials from './Testimonials';
import HowItWorks from './HowItWorks';
import FAQ from './FAQ';
import ContactUs from './ContactUs';
import CallToAction from './CallToAction';

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedRentals />
      <AboutSection />
      <WhyChooseUs />
      <Testimonials />
      <HowItWorks />
      <FAQ />
      <ContactUs />
      <CallToAction />
    </main>
  );
};

export default HomePage;
