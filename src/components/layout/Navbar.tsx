
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Building, Phone, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/properties', label: 'Properties', icon: Building },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <nav className={`glass-effect sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'shadow-luxury border-b border-satin-silver/30'
        : 'border-b border-satin-silver/20'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Enhanced logo - responsive */}
        <Link to="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="Musilli Homes"
            className="h-8 sm:h-10 lg:h-12 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Enhanced Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 font-light tracking-wide touch-friendly ${
                  isActive(item.path)
                    ? 'bg-gold-whisper/10 text-gold-whisper'
                    : 'luxury-heading hover:text-gold-whisper hover:bg-soft-ivory'
                }`}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Enhanced Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="luxury-heading hover:text-gold-whisper hover:bg-soft-ivory transition-all duration-300 touch-friendly p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-satin-silver/30 animate-fade-in-down">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 p-3 sm:p-4 rounded-lg transition-all duration-300 font-light tracking-wide animate-fade-in-up touch-friendly ${
                    isActive(item.path)
                      ? 'bg-gold-whisper/10 text-gold-whisper'
                      : 'luxury-heading hover:text-gold-whisper hover:bg-soft-ivory'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-base sm:text-lg">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
