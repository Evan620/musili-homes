
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutSection: React.FC = () => {
  return (
    <section className="py-32 bg-pure-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-5xl font-thin luxury-heading mb-8 tracking-wide">Musili Homes</h2>
            <div className="w-20 h-px bg-gold-whisper mb-12"></div>
            <p className="text-xl luxury-text mb-8 leading-relaxed">
              Dedicated to providing an exceptional real estate experience for discerning clients seeking Kenya's most prestigious properties.
            </p>
            <p className="text-xl luxury-text mb-8 leading-relaxed">
              Our team of professionals understands the unique requirements of high-net-worth individuals seeking exceptional properties.
            </p>
            <p className="text-xl luxury-text mb-12 leading-relaxed">
              Whether you're looking to buy, sell, or invest in premium real estate across Kenya, Musili Homes offers unparalleled expertise and personalized service.
            </p>
            <Link to="/contact">
              <Button className="bg-deep-charcoal text-pure-white hover:bg-deep-charcoal/90 px-12 py-4 font-light tracking-wide transition-all duration-300">
                Contact Our Team
              </Button>
            </Link>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80" 
                alt="Musili Homes Team" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-gold-whisper text-pure-white p-8 shadow-xl">
              <p className="text-4xl font-thin mb-2">15+</p>
              <p className="text-lg font-light tracking-wide">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
