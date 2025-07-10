import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty, useAgent } from '@/hooks/useData';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize2, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContactAgentForm from '@/components/properties/ContactAgentForm';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id, 10) : 0;

  const { data: property, isLoading: propertyLoading, isError: propertyError } = useProperty(propertyId);
  const { data: agent, isLoading: agentLoading } = useAgent(property?.agent_id || 0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const { toast } = useToast();

  // Set active image when property loads
  React.useEffect(() => {
    if (property && property.images.length > 0 && activeIndex === 0) {
      setActiveIndex(0);
    }
  }, [property, activeIndex]);

  const isLoading = propertyLoading || agentLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-deep-charcoal">Loading property details...</div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="mb-8">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties">
          <Button>Back to Properties</Button>
        </Link>
      </div>
    );
  }
  
  const handleContactAgent = () => {
    setShowContactForm(true);
  };

  const handleRequestViewing = () => {
    setShowContactForm(true);
  };

  return (
    <div className="min-h-screen bg-offWhite pb-12">
      {/* Hero Section Title/Info Above Carousel */}
      <div className="w-full bg-navy pt-8 pb-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white/95 rounded-2xl shadow-xl border-t-4 border-gold flex flex-col md:flex-row md:items-center md:justify-between p-6 md:p-8 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-navy mb-2 tracking-tight relative">
                <span className="pr-2">{property.title}</span>
                <span className="block w-16 h-1 bg-gradient-to-r from-gold to-gold/60 rounded-full mt-2 mb-1"></span>
              </h1>
              <div className="flex items-center text-lg text-charcoal/80 font-medium mb-1">
                <MapPin className="h-5 w-5 mr-2 text-gold" />
                <span className="truncate">{property.address}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-8 flex-shrink-0">
              <div className="inline-block bg-gradient-to-br from-gold/90 to-gold/60 text-navy font-extrabold text-2xl md:text-3xl px-6 py-3 rounded-xl shadow border-2 border-gold">
                {formatCurrency(property.price)} KES
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Carousel with Thumbnails */}
      <div className="relative w-full bg-navy">
        <Carousel className="w-full max-w-5xl mx-auto"
          opts={{
            startIndex: activeIndex,
            skipSnaps: false,
            containScroll: 'trimSnaps',
          }}
          setApi={api => {
            if (api) {
              api.on('select', () => {
                setActiveIndex(api.selectedScrollSnap());
              });
            }
          }}
        >
          <CarouselContent>
            {property.images.map((image, idx) => {
              let src = '';
              if (typeof image === 'string') {
                src = image;
              } else if (typeof image === 'object' && image !== null && 'image_url' in image) {
                src = (image as { image_url: string }).image_url;
              }
              return (
                <CarouselItem key={idx} className="aspect-video">
                  <img
                    src={src}
                    alt={`${property.title} - View ${idx + 1}`}
                    className="w-full h-full object-cover rounded-b-3xl shadow-xl border-4 border-gold"
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="z-10 bg-white/80 hover:bg-gold text-navy border-gold" />
          <CarouselNext className="z-10 bg-white/80 hover:bg-gold text-navy border-gold" />
        </Carousel>
        {/* Thumbnails below carousel */}
        <div className="max-w-5xl mx-auto flex flex-row gap-3 mt-4 px-4 justify-center">
          {property.images.map((image, idx) => {
            let src = '';
            if (typeof image === 'string') {
              src = image;
            } else if (typeof image === 'object' && image !== null && 'image_url' in image) {
              src = (image as { image_url: string }).image_url;
            }
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeIndex === idx ? 'border-gold shadow-lg ring-2 ring-gold' : 'border-gray-300'
                }`}
                style={{ outline: 'none' }}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {activeIndex === idx && (
                  <span className="absolute inset-0 border-4 border-gold rounded-lg pointer-events-none"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Property details */}
            <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 border-t-4 border-gold">
              <h2 className="text-2xl font-bold text-navy mb-6">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col items-center p-4 bg-offWhite rounded-xl border border-gold/20">
                  <Bed className="h-7 w-7 text-gold mb-2" />
                  <span className="text-base text-charcoal/70">Bedrooms</span>
                  <span className="text-2xl font-bold text-navy">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite rounded-xl border border-gold/20">
                  <Bath className="h-7 w-7 text-gold mb-2" />
                  <span className="text-base text-charcoal/70">Bathrooms</span>
                  <span className="text-2xl font-bold text-navy">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite rounded-xl border border-gold/20">
                  <Maximize2 className="h-7 w-7 text-gold mb-2" />
                  <span className="text-base text-charcoal/70">Area</span>
                  <span className="text-2xl font-bold text-navy">{property.size} sqft</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-offWhite rounded-xl border border-gold/20">
                  <MapPin className="h-7 w-7 text-gold mb-2" />
                  <span className="text-base text-charcoal/70">Location</span>
                  <span className="text-2xl font-bold text-navy">{property.location}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Description</h3>
              <p className="text-charcoal/90 text-lg leading-relaxed mb-6">
                {property.description}
              </p>
            </div>
          </div>
          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-8">
              {/* Agent info luxury card */}
              {agent && (
                <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {agent.photo ? (
                      <img src={agent.photo} alt={agent.name} className="w-20 h-20 rounded-full border-4 border-gold shadow-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-gold bg-gray-200 flex items-center justify-center text-gold text-3xl font-extrabold shadow-lg">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    {/* Badge example */}
                    <span className="absolute -bottom-2 -right-2 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full shadow">Verified</span>
                  </div>
                  <h4 className="font-extrabold text-navy text-xl mb-1">{agent.name}</h4>
                  <p className="text-gold font-semibold mb-2">Luxury Property Specialist</p>
                  <div className="w-full space-y-2 mb-4">
                    <div className="flex items-center justify-center">
                      <Phone className="h-5 w-5 mr-2 text-gold" />
                      <span className="text-base text-charcoal/80">{agent.phone}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Mail className="h-5 w-5 mr-2 text-gold" />
                      <span className="text-base text-charcoal/80">{agent.email}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleContactAgent}
                    className="w-full bg-gold text-navy hover:bg-gold/90 font-bold text-lg py-3 rounded-xl shadow-md"
                  >
                    Contact Agent
                  </Button>
                </div>
              )}
              {/* Schedule Viewing luxury card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-4 border-gold">
                <h3 className="text-xl font-bold text-navy mb-4">Schedule a Viewing</h3>
                <p className="text-charcoal/80 mb-4 text-lg">
                  Interested in this property? Schedule a viewing at your convenience.
                </p>
                <Button
                  onClick={handleRequestViewing}
                  className="w-full bg-navy text-gold hover:bg-navy/90 font-bold text-lg py-3 rounded-xl shadow-md"
                >
                  Request Viewing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Agent Form Dialog */}
      {property && (
        <ContactAgentForm
          agent={agent}
          property={property}
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
