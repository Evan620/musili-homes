
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
    <div className="bg-gradient-to-br from-pure-white to-soft-ivory/30 p-6 rounded-2xl shadow-xl border border-satin-silver/20">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="location" className="block text-sm font-light luxury-heading mb-2 tracking-wide">
              Location
            </label>
            <Input
              id="location"
              type="text"
              placeholder="Any location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-4 py-3 font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="minPrice" className="block text-sm font-light luxury-heading mb-2 tracking-wide">
              Min Price (KES)
            </label>
            <Input
              id="minPrice"
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-4 py-3 font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-light luxury-heading mb-2 tracking-wide">
              Max Price (KES)
            </label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-4 py-3 font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-light luxury-heading mb-2 tracking-wide">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal rounded-xl px-4 py-3 font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button type="submit" className="luxury-button-primary px-8 py-3 font-light tracking-wide">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
          <Button type="button" variant="outline" onClick={handleClear} className="luxury-button-secondary px-8 py-3 font-light tracking-wide">
            Clear Filters
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertySearch;
