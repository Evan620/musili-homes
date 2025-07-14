import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty, useAgent } from '@/hooks/useData';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize2, MapPin, Phone, Mail, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContactAgentForm from '@/components/properties/ContactAgentForm';
import { PropertyDescription } from '@/components/ui/formatted-text';
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Hero Section */}
      <div className="relative w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold-whisper/20 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-whisper/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Main content container */}
            <div className="flex-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 md:p-12">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-gradient-to-r from-gold-whisper to-gold-accent p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                      <Bed className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-gold-whisper font-semibold text-xs sm:text-sm uppercase tracking-wide">Premium Property</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-800 mb-3 sm:mb-4 leading-tight">
                    {property.title}
                  </h1>

                  <div className="flex items-start sm:items-center text-base sm:text-xl text-slate-600 font-medium mb-4 sm:mb-6">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gold-whisper flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{property.address}</span>
                  </div>

                  {/* Mobile-optimized feature pills */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
                      <Bed className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
                      <Bath className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{property.bathrooms} Baths</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full justify-center sm:justify-start">
                      <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{property.size} sqft</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price container moved to the right side */}
            <div className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-gradient-to-br from-gold-whisper to-gold-accent p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-center lg:sticky lg:top-8">
                <div className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wide mb-1 sm:mb-2">Price</div>
                <div className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2 break-words">
                  {formatCurrency(property.price)}
                </div>
                <div className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">KES</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile-Optimized Image Gallery */}
      <div className="relative w-full bg-gradient-to-b from-slate-900 to-slate-800 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Carousel
            className="w-full relative"
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
                  <CarouselItem key={idx}>
                    {/* Fixed height container for consistent image sizing */}
                    <div
                      className="relative group overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] cursor-pointer"
                      onClick={() => {
                        setModalImageIndex(idx);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={src}
                        alt={`${property.title} - View ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Click to expand indicator */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                          <Maximize2 className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Mobile-optimized image counter */}
                      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-black/50 backdrop-blur-sm text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                        {idx + 1} / {property.images.length}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Centered navigation buttons */}
            <CarouselPrevious className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-slate-800 border-0 shadow-lg hover:scale-110 transition-all duration-200" />
            <CarouselNext className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-slate-800 border-0 shadow-lg hover:scale-110 transition-all duration-200" />
          </Carousel>

          {/* Mobile-optimized thumbnails */}
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-8 justify-center overflow-x-auto pb-2 scrollbar-hide">
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
                  className={`relative flex-shrink-0 w-16 h-12 sm:w-24 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 touch-friendly ${
                    activeIndex === idx
                      ? 'ring-2 sm:ring-4 ring-gold-whisper shadow-lg shadow-gold-whisper/25'
                      : 'ring-1 sm:ring-2 ring-white/20 hover:ring-white/40'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {activeIndex === idx && (
                    <div className="absolute inset-0 bg-gold-whisper/20 flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gold-whisper rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Mobile-Optimized Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Mobile-Optimized Property Features */}
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                  <Bed className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Property Features</h2>
                  <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Key details and specifications</p>
                </div>
              </div>

              {/* Mobile-first grid layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Bed className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-1">Bedrooms</span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{property.bedrooms}</span>
                </div>

                <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Bath className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-1">Bathrooms</span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{property.bathrooms}</span>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-1">Area</span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{property.size} sqft</span>
                </div>

                <div className="group bg-gradient-to-br from-amber-50 to-amber-100 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-amber-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105 col-span-2 lg:col-span-1">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 sm:p-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-1">Location</span>
                  <span className="text-base sm:text-lg lg:text-lg font-bold text-slate-800 break-words">{property.location}</span>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Property Description */}
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                  <Bed className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">About This Property</h3>
                  <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Detailed description and highlights</p>
                </div>
              </div>

              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                <PropertyDescription
                  description={property.description}
                  className="sm:text-base lg:text-lg"
                  size="base"
                />
              </div>
            </div>
          </div>
          {/* Mobile-Optimized Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6 sm:space-y-8">
              {/* Mobile-Optimized Agent Card */}
              {agent && (
                <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 opacity-50 rounded-xl sm:rounded-2xl"></div>

                    <div className="relative flex flex-col items-center text-center">
                      <div className="relative mb-4 sm:mb-6">
                        {agent.photo ? (
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 sm:border-4 border-white shadow-xl object-cover ring-2 sm:ring-4 ring-emerald-100"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-2 sm:border-4 border-white shadow-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center ring-2 sm:ring-4 ring-emerald-100">
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{agent.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg">
                          ✓ Verified
                        </div>
                      </div>

                      <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">{agent.name}</h4>
                      <p className="text-emerald-600 font-semibold mb-4 sm:mb-6 text-sm sm:text-base">Luxury Property Specialist</p>

                      <div className="w-full space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-white/80 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-slate-700 font-medium text-sm sm:text-base break-all">{agent.phone}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-white/80 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-slate-700 font-medium text-sm sm:text-base break-all">{agent.email}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleContactAgent}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 font-bold text-sm sm:text-base lg:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 touch-friendly"
                      >
                        Contact Agent
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile-Optimized Schedule Viewing Card */}
              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 rounded-xl sm:rounded-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                        <Phone className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">Schedule Viewing</h3>
                        <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">Book your visit today</p>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                      Interested in this property? Schedule a viewing at your convenience and explore this amazing space.
                    </p>

                    <Button
                      onClick={handleRequestViewing}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 font-bold text-sm sm:text-base lg:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 touch-friendly"
                    >
                      Request Viewing
                    </Button>
                  </div>
                </div>
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

      {/* Image Modal */}
      {showImageModal && property && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative w-full h-full max-w-7xl max-h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Carousel */}
            <Carousel
              className="w-full h-full flex-1"
              opts={{
                startIndex: modalImageIndex,
                skipSnaps: false,
                containScroll: 'trimSnaps',
                align: 'center',
              }}
            >
              <CarouselContent className="h-full -ml-0">
                {property.images.map((image, idx) => {
                  let src = '';
                  if (typeof image === 'string') {
                    src = image;
                  } else if (typeof image === 'object' && image !== null && 'image_url' in image) {
                    src = (image as { image_url: string }).image_url;
                  }
                  return (
                    <CarouselItem key={idx} className="h-full flex items-center justify-center pl-0 basis-full">
                      <div className="relative w-full h-full flex items-center justify-center min-h-0">
                        <img
                          src={src}
                          alt={`${property.title} - View ${idx + 1}`}
                          className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] object-contain rounded-lg shadow-2xl"
                        />
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                          {idx + 1} / {property.images.length}
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {/* Modal navigation buttons */}
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg hover:scale-110 transition-all duration-200" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg hover:scale-110 transition-all duration-200" />
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
