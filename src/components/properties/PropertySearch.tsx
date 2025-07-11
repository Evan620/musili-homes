
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, DollarSign, Bed, X, Filter, Sparkles } from 'lucide-react';

interface PropertySearchProps {
  onSearch: (searchParams: any) => void;
}

const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: location.trim(),
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
    });
  };

  const handleClear = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    onSearch({
      location: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
    });
  };

  return (
    <div className="luxury-card-elevated p-8 rounded-2xl shadow-luxury-xl relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-whisper/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-accent/5 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-xl shadow-gold">
          <Filter className="w-6 h-6 text-pure-white" />
        </div>
        <div>
          <h3 className="text-2xl font-thin tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
            Find Your Perfect Property
          </h3>
          <p className="text-sm opacity-70 mt-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>
            Use our advanced filters to discover your ideal home
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Location Field */}
          <div className="group">
            <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium mb-3 tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              <MapPin className="w-4 h-4 text-gold-whisper" />
              Location
            </label>
            <div className="relative">
              <Input
                id="location"
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-pure-white border-2 border-satin-silver/40 hover:border-gold-whisper/50 focus:border-gold-whisper focus:ring-2 focus:ring-gold-whisper/20 rounded-xl px-4 py-3 pl-10 font-light transition-all duration-300 group-hover:shadow-md"
                style={{ color: 'hsl(var(--deep-charcoal))' }}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-whisper/60" />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-satin-silver/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-deep-charcoal/60" />
                </button>
              )}
            </div>
          </div>

          {/* Min Price Field */}
          <div className="group">
            <label htmlFor="minPrice" className="flex items-center gap-2 text-sm font-medium mb-3 tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              <DollarSign className="w-4 h-4 text-gold-whisper" />
              Min Price (KES)
            </label>
            <div className="relative">
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-pure-white border-2 border-satin-silver/40 hover:border-gold-whisper/50 focus:border-gold-whisper focus:ring-2 focus:ring-gold-whisper/20 rounded-xl px-4 py-3 pl-10 font-light transition-all duration-300 group-hover:shadow-md"
                style={{ color: 'hsl(var(--deep-charcoal))' }}
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-whisper/60" />
              {minPrice && (
                <button
                  type="button"
                  onClick={() => setMinPrice('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-satin-silver/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-deep-charcoal/60" />
                </button>
              )}
            </div>
          </div>

          {/* Max Price Field */}
          <div className="group">
            <label htmlFor="maxPrice" className="flex items-center gap-2 text-sm font-medium mb-3 tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              <DollarSign className="w-4 h-4 text-gold-whisper" />
              Max Price (KES)
            </label>
            <div className="relative">
              <Input
                id="maxPrice"
                type="number"
                placeholder="No limit"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-pure-white border-2 border-satin-silver/40 hover:border-gold-whisper/50 focus:border-gold-whisper focus:ring-2 focus:ring-gold-whisper/20 rounded-xl px-4 py-3 pl-10 font-light transition-all duration-300 group-hover:shadow-md"
                style={{ color: 'hsl(var(--deep-charcoal))' }}
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-whisper/60" />
              {maxPrice && (
                <button
                  type="button"
                  onClick={() => setMaxPrice('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-satin-silver/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-deep-charcoal/60" />
                </button>
              )}
            </div>
          </div>

          {/* Bedrooms Field */}
          <div className="group">
            <label htmlFor="bedrooms" className="flex items-center gap-2 text-sm font-medium mb-3 tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              <Bed className="w-4 h-4 text-gold-whisper" />
              Bedrooms
            </label>
            <div className="relative">
              <select
                id="bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-pure-white border-2 border-satin-silver/40 hover:border-gold-whisper/50 focus:border-gold-whisper focus:ring-2 focus:ring-gold-whisper/20 rounded-xl px-4 py-3 pl-10 font-light transition-all duration-300 group-hover:shadow-md appearance-none cursor-pointer"
                style={{ color: 'hsl(var(--deep-charcoal))' }}
              >
                <option value="">Any bedrooms</option>
                <option value="1">1+ bedrooms</option>
                <option value="2">2+ bedrooms</option>
                <option value="3">3+ bedrooms</option>
                <option value="4">4+ bedrooms</option>
                <option value="5">5+ bedrooms</option>
              </select>
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-whisper/60 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gold-whisper/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 border-t border-satin-silver/20">
          <Button
            type="submit"
            className="group luxury-button-primary px-10 py-4 font-light tracking-wide shadow-gold hover:shadow-luxury-lg transition-all duration-300"
          >
            <Search className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Search Properties
            <Sparkles className="ml-3 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="group luxury-button-secondary px-8 py-4 font-light tracking-wide hover:shadow-md transition-all duration-300"
          >
            <X className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            Clear All Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        {(location || minPrice || maxPrice || bedrooms) && (
          <div className="mt-6 pt-6 border-t border-satin-silver/20">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gold-whisper" />
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {location && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gold-whisper/10 border border-gold-whisper/20 rounded-full text-sm">
                  <MapPin className="w-3 h-3 text-gold-whisper" />
                  <span style={{ color: 'hsl(var(--deep-charcoal))' }}>{location}</span>
                  <button
                    type="button"
                    onClick={() => setLocation('')}
                    className="p-0.5 hover:bg-gold-whisper/20 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gold-whisper" />
                  </button>
                </div>
              )}
              {minPrice && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gold-whisper/10 border border-gold-whisper/20 rounded-full text-sm">
                  <DollarSign className="w-3 h-3 text-gold-whisper" />
                  <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Min: {parseInt(minPrice).toLocaleString()} KES</span>
                  <button
                    type="button"
                    onClick={() => setMinPrice('')}
                    className="p-0.5 hover:bg-gold-whisper/20 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gold-whisper" />
                  </button>
                </div>
              )}
              {maxPrice && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gold-whisper/10 border border-gold-whisper/20 rounded-full text-sm">
                  <DollarSign className="w-3 h-3 text-gold-whisper" />
                  <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Max: {parseInt(maxPrice).toLocaleString()} KES</span>
                  <button
                    type="button"
                    onClick={() => setMaxPrice('')}
                    className="p-0.5 hover:bg-gold-whisper/20 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gold-whisper" />
                  </button>
                </div>
              )}
              {bedrooms && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gold-whisper/10 border border-gold-whisper/20 rounded-full text-sm">
                  <Bed className="w-3 h-3 text-gold-whisper" />
                  <span style={{ color: 'hsl(var(--deep-charcoal))' }}>{bedrooms}+ bedrooms</span>
                  <button
                    type="button"
                    onClick={() => setBedrooms('')}
                    className="p-0.5 hover:bg-gold-whisper/20 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gold-whisper" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertySearch;
