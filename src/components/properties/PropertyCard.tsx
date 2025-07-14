
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property, Agent } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Bed, Bath, Maximize2, MapPin, DollarSign, Home, Heart, Eye, Star } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  agent?: Agent;
  viewMode?: 'grid' | 'list';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, agent, viewMode = 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Enhanced status badge styling with luxury colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'For Sale':
        return {
          className: 'bg-gradient-to-r from-gold-whisper to-gold-accent text-pure-white shadow-luxury',
          icon: <DollarSign className="h-3 w-3 mr-1" />,
          text: 'FOR SALE'
        };
      case 'For Rent':
        return {
          className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-pure-white shadow-luxury',
          icon: <Home className="h-3 w-3 mr-1" />,
          text: 'FOR RENT'
        };
      case 'Sold':
        return {
          className: 'bg-gradient-to-r from-satin-silver to-pearl-silver text-deep-charcoal shadow-luxury',
          icon: <DollarSign className="h-3 w-3 mr-1" />,
          text: 'SOLD'
        };
      case 'Rented':
        return {
          className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-pure-white shadow-luxury',
          icon: <Home className="h-3 w-3 mr-1" />,
          text: 'RENTED'
        };
      default:
        return {
          className: 'bg-gradient-to-r from-satin-silver to-pearl-silver text-deep-charcoal shadow-luxury',
          icon: null,
          text: status.toUpperCase()
        };
    }
  };

  const statusBadge = getStatusBadge(property.status);

  // Enhanced agent display
  const agentDisplay = agent ? (
    <div className="mt-4 flex items-center gap-2 text-sm text-deep-charcoal/70">
      <div className="w-6 h-6 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-pure-white">{agent.name.charAt(0)}</span>
      </div>
      <span className="font-medium">{agent.name}</span>
    </div>
  ) : null;

  // List view layout
  if (viewMode === 'list') {
    return (
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          to={`/property/${property.id}`}
          className="block luxury-card-elevated rounded-xl overflow-hidden transition-all duration-500 hover:shadow-luxury-lg"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative md:w-80 h-64 md:h-48 overflow-hidden">
              <img
                src={(() => {
                  if (property.images && property.images.length > 0) {
                    const img = property.images[0];
                    if (typeof img === 'object' && img !== null && 'image_url' in img) {
                      return (img as { image_url: string }).image_url;
                    } else if (typeof img === 'string') {
                      return img as unknown as string;
                    }
                  }
                  return '';
                })()}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />

              {/* Status badge */}
              <div className={`absolute top-4 left-4 px-4 py-2 rounded-full flex items-center font-medium text-xs tracking-wide backdrop-blur-sm ${statusBadge.className}`}>
                {statusBadge.icon}
                {statusBadge.text}
              </div>

              {/* Featured badge */}
              {property.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-gold-whisper to-gold-accent p-2 rounded-full shadow-gold">
                  <Star className="h-4 w-4 text-pure-white fill-current" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-gold-whisper transition-colors duration-300" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                  {property.title}
                </h3>

                <div className="flex items-center mb-4" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                  <MapPin className="h-4 w-4 mr-2 text-gold-whisper" />
                  <span className="text-sm font-medium opacity-80">{property.location}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-2xl font-bold text-gold-whisper">
                    {formatCurrency(property.price)}
                  </p>
                  <span className="text-sm font-medium opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>KES</span>
                </div>

                {/* Property features - horizontal layout for list view */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-soft-ivory rounded-lg">
                      <Bed className="h-4 w-4 text-gold-whisper" />
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.bedrooms}</span>
                      <span className="text-xs opacity-70 ml-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>Beds</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-soft-ivory rounded-lg">
                      <Bath className="h-4 w-4 text-gold-whisper" />
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.bathrooms}</span>
                      <span className="text-xs opacity-70 ml-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>Baths</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-soft-ivory rounded-lg">
                      <Maximize2 className="h-4 w-4 text-gold-whisper" />
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.size || 'N/A'}</span>
                      <span className="text-xs opacity-70 ml-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>sqft</span>
                    </div>
                  </div>
                </div>
              </div>

              {agentDisplay}
            </div>

            {/* Action buttons for list view */}
            <div className="p-6 flex flex-col justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorited(!isFavorited);
                }}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${isFavorited ? 'bg-soft-crimson text-pure-white' : 'bg-soft-ivory text-gold-whisper hover:bg-gold-whisper/10'}`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <div className="p-3 rounded-full bg-soft-ivory text-gold-whisper hover:bg-gold-whisper/10 transition-all duration-300 hover:scale-110">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view layout (default)
  return (
    <div
      className="group relative h-[580px]" // Fixed height for consistency
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/property/${property.id}`}
        className="block h-full luxury-card-elevated rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] flex flex-col"
      >
        <div className="relative h-72 overflow-hidden">
          <img
            src={(() => {
              if (property.images && property.images.length > 0) {
                const img = property.images[0];
                if (typeof img === 'object' && img !== null && 'image_url' in img) {
                  return (img as { image_url: string }).image_url;
                } else if (typeof img === 'string') {
                  return img as unknown as string;
                }
              }
              return '';
            })()}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />

          {/* Enhanced overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Status badge */}
          <div className={`absolute top-4 left-4 px-4 py-2 rounded-full flex items-center font-medium text-xs tracking-wide backdrop-blur-sm ${statusBadge.className}`}>
            {statusBadge.icon}
            {statusBadge.text}
          </div>

          {/* Featured badge for featured properties */}
          {property.featured && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-gold-whisper to-gold-accent p-2 rounded-full shadow-gold">
              <Star className="h-4 w-4 text-pure-white fill-current" />
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorited(!isFavorited);
                }}
                className={`p-3 rounded-full glass-effect transition-all duration-300 hover:scale-110 ${isFavorited ? 'bg-soft-crimson text-pure-white' : 'text-pure-white hover:bg-pure-white/20'}`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <div className="p-3 rounded-full glass-effect text-pure-white hover:bg-pure-white/20 transition-all duration-300 hover:scale-110">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced content section */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-gold-whisper transition-colors duration-300" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                {property.title}
              </h3>

              <div className="flex items-center mb-3" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                <MapPin className="h-4 w-4 mr-2 text-gold-whisper" />
                <span className="text-sm font-medium opacity-80 line-clamp-1">{property.location}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-2xl font-bold text-gold-whisper">
                {formatCurrency(property.price)}
              </p>
              <span className="text-sm font-medium opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>KES</span>
            </div>

            {/* Enhanced property features */}
            <div className="border-t border-satin-silver/50 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-soft-ivory rounded-lg mb-2 group-hover:bg-gold-whisper/10 transition-colors duration-300">
                    <Bed className="h-4 w-4 text-gold-whisper" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.bedrooms}</span>
                  <span className="text-xs opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>Beds</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-soft-ivory rounded-lg mb-2 group-hover:bg-gold-whisper/10 transition-colors duration-300">
                    <Bath className="h-4 w-4 text-gold-whisper" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.bathrooms}</span>
                  <span className="text-xs opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>Baths</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-soft-ivory rounded-lg mb-2 group-hover:bg-gold-whisper/10 transition-colors duration-300">
                    <Maximize2 className="h-4 w-4 text-gold-whisper" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>{property.size || 'N/A'}</span>
                  <span className="text-xs opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>sqft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent display at bottom */}
          {agentDisplay}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
