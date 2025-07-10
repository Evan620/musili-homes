
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AboutSection from '@/components/home/AboutSection';
import ContactCTA from '@/components/home/ContactCTA';
import AIAssistantSection from '@/components/home/AIAssistantSection';



const Index = () => {

  return (
    <div className="min-h-screen">
      <HeroSection />

      <FeaturedProperties />

      <AIAssistantSection />

      <AboutSection />
      <ContactCTA />


    </div>
  );
};

export default Index;
