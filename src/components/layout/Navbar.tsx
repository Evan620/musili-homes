
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-pure-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-satin-silver">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl font-thin tracking-wider luxury-heading">
            MUSILI <span className="luxury-accent">HOMES</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-12">
          <Link to="/" className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide">Home</Link>
          <Link to="/properties" className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide">Properties</Link>
          <Link to="/contact" className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide">Contact</Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="luxury-heading hover:text-gold-whisper"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-pure-white border-t border-satin-silver">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-6">
            <Link 
              to="/" 
              className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              to="/contact"
              className="luxury-heading hover:text-gold-whisper transition-colors font-light tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
