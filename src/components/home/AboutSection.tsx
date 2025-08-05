
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Users, MapPin, TrendingUp, ArrowRight, Shield, Heart } from 'lucide-react';

const AboutSection: React.FC = () => {
  const stats = [
    { icon: Award, value: '15+', label: 'Years of Excellence' },
    { icon: Users, value: '500+', label: 'Happy Clients' },
    { icon: MapPin, value: '50+', label: 'Premium Properties' },
    { icon: TrendingUp, value: '98%', label: 'Client Satisfaction' },
  ];

  const values = [
    { icon: Shield, title: 'Trust & Integrity', description: 'Building lasting relationships through transparency and honesty' },
    { icon: Award, title: 'Excellence', description: 'Delivering exceptional service that exceeds expectations' },
    { icon: Heart, title: 'Personalized Care', description: 'Understanding and fulfilling your unique property needs' },
  ];

  return (
    <section className="py-32 bg-pure-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gold-whisper rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gold-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-pure-white" />
                </div>
                <span className="text-sm uppercase tracking-widest text-gold-whisper font-medium">About Us</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-thin luxury-heading mb-8 tracking-wide">
                Musilli Homes
              </h2>

              <div className="flex items-center mb-12">
                <div className="w-16 h-px bg-gold-whisper"></div>
                <Heart className="w-6 h-6 text-gold-whisper mx-4" />
                <div className="w-16 h-px bg-gold-whisper"></div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xl leading-relaxed" style={{ color: 'hsl(var(--deep-charcoal))', fontWeight: '300' }}>
                Dedicated to providing an exceptional real estate experience for discerning clients seeking Kenya's most prestigious properties.
              </p>
              <p className="text-xl leading-relaxed" style={{ color: 'hsl(var(--deep-charcoal))', fontWeight: '300' }}>
                Our team of professionals understands the unique requirements of high-net-worth individuals seeking exceptional properties.
              </p>
              <p className="text-xl leading-relaxed" style={{ color: 'hsl(var(--deep-charcoal))', fontWeight: '300' }}>
                Whether you're looking to buy, sell, or invest in premium real estate across Kenya, Musilli Homes offers unparalleled expertise and personalized service.
              </p>
            </div>

            <Link to="/contact">
              <Button className="group luxury-button-primary px-12 py-4 font-light tracking-wide">
                <span className="flex items-center gap-3">
                  Contact Our Team
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-luxury-xl">
                <img
                  src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80"
                  alt="Musilli Homes Team"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-8 -left-8 bg-gradient-to-r from-gold-whisper to-gold-accent text-pure-white p-8 rounded-xl shadow-gold">
                <p className="text-4xl font-thin mb-2">15+</p>
                <p className="text-lg font-light tracking-wide">Years of Excellence</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-soft-ivory rounded-full opacity-80"></div>
              <div className="absolute top-8 -right-2 w-12 h-12 bg-gold-whisper/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Enhanced stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-gold">
                  <Icon className="w-8 h-8 text-pure-white" />
                </div>
                <p className="text-3xl font-thin mb-2" style={{ color: 'hsl(var(--deep-charcoal))' }}>{stat.value}</p>
                <p className="text-sm uppercase tracking-wider opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Values section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-thin mb-8" style={{ color: 'hsl(var(--deep-charcoal))' }}>Our Values</h3>
          <div className="w-16 h-px bg-gold-whisper mx-auto mb-12"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center p-8 luxury-card group hover:shadow-luxury-lg transition-all duration-500">
                <div className="w-16 h-16 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-pure-white" />
                </div>
                <h4 className="text-xl font-medium mb-4" style={{ color: 'hsl(var(--deep-charcoal))' }}>{value.title}</h4>
                <p className="leading-relaxed" style={{ color: 'hsl(var(--deep-charcoal))', fontWeight: '300' }}>{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
