
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home as HomeIcon, Building, Phone, Sparkles } from 'lucide-react';

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
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/properties', label: 'Properties', icon: Building },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <nav className={`glass-effect sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'shadow-luxury border-b border-satin-silver/30'
        : 'border-b border-satin-silver/20'
    }`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Enhanced logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-lg shadow-gold group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-pure-white" />
          </div>
          <span className="text-2xl font-thin tracking-wider luxury-heading group-hover:text-gold-whisper transition-colors duration-300">
            MUSILI <span className="luxury-accent font-medium">HOMES</span>
          </span>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-light tracking-wide ${
                  isActive(item.path)
                    ? 'bg-gold-whisper/10 text-gold-whisper'
                    : 'luxury-heading hover:text-gold-whisper hover:bg-soft-ivory'
                }`}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>{item.label}</span>
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
            className="luxury-heading hover:text-gold-whisper hover:bg-soft-ivory transition-all duration-300"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-satin-silver/30 animate-fade-in-down">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 font-light tracking-wide animate-fade-in-up ${
                    isActive(item.path)
                      ? 'bg-gold-whisper/10 text-gold-whisper'
                      : 'luxury-heading hover:text-gold-whisper hover:bg-soft-ivory'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
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
