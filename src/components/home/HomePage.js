import React from 'react';
import HeroSection from './HeroSection';
import FeaturedRentals from '../rentals/FeaturedRentals';
import PartyPackages from '../packages/PartyPackages';
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
      <PartyPackages />
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
