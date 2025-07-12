
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, Home, MapPin } from 'lucide-react';

const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced background with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80')`,
          transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Floating elements - responsive positioning */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 animate-float">
        <div className="glass-effect-dark p-2 sm:p-4 rounded-full">
          <Home className="w-4 h-4 sm:w-6 sm:h-6 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute top-16 sm:top-32 right-8 sm:right-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="glass-effect-dark p-2 sm:p-3 rounded-full">
          <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute bottom-16 sm:bottom-32 left-10 sm:left-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass-effect-dark p-2 sm:p-3 rounded-full">
          <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 z-10 relative text-center">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced title with staggered animation */}
          <div className="mb-6 sm:mb-8">
            <h1 className="hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-thin tracking-wider animate-fade-in-up">
              Luxury Living
            </h1>
            <div className="flex items-center justify-center mt-3 sm:mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 sm:w-16 h-px bg-gold-whisper"></div>
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-gold-whisper mx-3 sm:mx-4 animate-glow" />
              <div className="w-12 sm:w-16 h-px bg-gold-whisper"></div>
            </div>
          </div>

          <p className="hero-text text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 font-light leading-relaxed max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Discover exceptional properties in Kenya's most prestigious locations.
            <span className="block mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg opacity-90">Where luxury meets lifestyle</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link to="/properties">
              <Button className="luxury-button-primary text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 font-light tracking-wide transition-all duration-500 hover:scale-105 shadow-gold group w-full sm:w-auto touch-friendly">
                <span className="flex items-center justify-center gap-2">
                  Explore Collection
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="hero-button-outline border-pure-white border-2 glass-effect hover:bg-pure-white hover:text-deep-charcoal text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 font-light tracking-wide transition-all duration-500 group w-full sm:w-auto touch-friendly">
                <span className="flex items-center justify-center gap-2">
                  Contact Us
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Stats section */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="hero-text text-2xl sm:text-3xl font-light mb-1 sm:mb-2">50+</div>
              <div className="hero-text text-xs sm:text-sm opacity-80 uppercase tracking-wider">Premium Properties</div>
            </div>
            <div className="text-center">
              <div className="hero-text text-2xl sm:text-3xl font-light mb-1 sm:mb-2">15+</div>
              <div className="hero-text text-xs sm:text-sm opacity-80 uppercase tracking-wider">Prime Locations</div>
            </div>
            <div className="text-center">
              <div className="hero-text text-2xl sm:text-3xl font-light mb-1 sm:mb-2">100%</div>
              <div className="hero-text text-xs sm:text-sm opacity-80 uppercase tracking-wider">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <div className="hero-text text-xs sm:text-sm uppercase tracking-wider opacity-70">Scroll to explore</div>
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-pure-white/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
