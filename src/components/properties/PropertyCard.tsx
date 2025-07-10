
import React from 'react';
import { Link } from 'react-router-dom';
import { Property, Agent } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Bed, Bath, Maximize2, MapPin, DollarSign, Home } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  agent?: Agent;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, agent }) => {
  // Get status badge styling and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'For Sale':
        return {
          className: 'bg-red-500 text-white shadow-lg',
          icon: <DollarSign className="h-3 w-3 mr-1" />,
          text: 'FOR SALE'
        };
      case 'For Rent':
        return {
          className: 'bg-green-500 text-white shadow-lg',
          icon: <Home className="h-3 w-3 mr-1" />,
          text: 'FOR RENT'
        };
      case 'Sold':
        return {
          className: 'bg-gray-500 text-white shadow-lg',
          icon: <DollarSign className="h-3 w-3 mr-1" />,
          text: 'SOLD'
        };
      case 'Rented':
        return {
          className: 'bg-purple-500 text-white shadow-lg',
          icon: <Home className="h-3 w-3 mr-1" />,
          text: 'RENTED'
        };
      default:
        return {
          className: 'bg-gray-400 text-white shadow-lg',
          icon: null,
          text: status.toUpperCase()
        };
    }
  };

  const statusBadge = getStatusBadge(property.status);

  // Agent display
  const agentDisplay = agent ? (
    <div className="mt-4 text-sm text-gray-600">
      <span className="font-semibold">Agent:</span> {agent.name}
    </div>
  ) : null;

  return (
    <Link 
      to={`/property/${property.id}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 property-card"
    >
      <div className="relative h-64">
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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center font-medium text-xs tracking-wide ${statusBadge.className}`}>
          {statusBadge.icon}
          {statusBadge.text}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-navy mb-1 font-playfair">{property.title}</h3>
        
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-xl font-bold text-gold mb-4">
          {formatCurrency(property.price)} KES
        </p>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-charcoal/70">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center">
              <Maximize2 className="h-4 w-4 mr-1" />
              <span>{property.size} sqft</span>
            </div>
          </div>
        </div>
        {agentDisplay}
      </div>
    </Link>
  );
};

export default PropertyCard;
