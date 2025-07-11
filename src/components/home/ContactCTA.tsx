
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail, MapPin, Sparkles } from 'lucide-react';

const ContactCTA: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-luxury">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gold-whisper rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gold-accent rounded-full blur-3xl"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="luxury-card p-4 rounded-full shadow-gold">
          <Phone className="w-6 h-6 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute top-32 right-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="luxury-card p-3 rounded-full shadow-gold">
          <Mail className="w-5 h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="luxury-card p-3 rounded-full shadow-gold">
          <MapPin className="w-5 h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Enhanced header */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-gold-whisper animate-glow" />
              <span className="text-sm uppercase tracking-widest mx-4 font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>Get Started</span>
              <Sparkles className="w-8 h-8 text-gold-whisper animate-glow" />
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-thin mb-8 tracking-wide animate-fade-in-up" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              Begin Your Journey
            </h2>

            <div className="flex items-center justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-px bg-gold-whisper"></div>
              <Sparkles className="w-6 h-6 text-gold-whisper mx-4 animate-glow" />
              <div className="w-20 h-px bg-gold-whisper"></div>
            </div>
          </div>

          <p className="text-2xl font-light mb-16 leading-relaxed max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s', color: 'hsl(var(--deep-charcoal))' }}>
            Connect with our team of luxury property experts to discover your perfect Kenyan property.
            <span className="block mt-4 text-xl opacity-90" style={{ color: 'hsl(var(--deep-charcoal))' }}>Your dream home awaits</span>
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link to="/contact">
              <Button className="group luxury-button-primary px-12 py-4 font-light tracking-wide shadow-gold">
                <span className="flex items-center gap-3">
                  Contact Us
                  <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" className="group border-deep-charcoal border-2 bg-pure-white hover:bg-deep-charcoal hover:text-pure-white px-12 py-4 font-light tracking-wide transition-all duration-300">
                <span className="flex items-center gap-3" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                  Browse Collection
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'hsl(var(--deep-charcoal))' }} />
                </span>
              </Button>
            </Link>
          </div>

          {/* Contact info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="luxury-card p-6 rounded-xl text-center shadow-luxury">
              <Phone className="w-8 h-8 text-gold-whisper mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>Call Us</p>
              <p className="text-lg" style={{ color: 'hsl(var(--deep-charcoal))' }}>+254 700 000 000</p>
            </div>
            <div className="luxury-card p-6 rounded-xl text-center shadow-luxury">
              <Mail className="w-8 h-8 text-gold-whisper mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>Email Us</p>
              <p className="text-lg" style={{ color: 'hsl(var(--deep-charcoal))' }}>info@musilihomes.co.ke</p>
            </div>
            <div className="luxury-card p-6 rounded-xl text-center shadow-luxury">
              <MapPin className="w-8 h-8 text-gold-whisper mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>Visit Us</p>
              <p className="text-lg" style={{ color: 'hsl(var(--deep-charcoal))' }}>Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
