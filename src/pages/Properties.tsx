
import React, { useState, useMemo, useEffect } from 'react';
import PropertyGrid from '@/components/properties/PropertyGrid';
import PropertySearch from '@/components/properties/PropertySearch';
import { useProperties } from '@/hooks/useData';
import { useAgents } from '@/hooks/useData';
import { LoadingState, ErrorState, EmptyState, PropertyGridSkeleton } from '@/components/ui/loading';
import { DataStatus } from '@/components/ui/data-status';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Building, MapPin, TrendingUp, Sparkles, Filter, Grid3X3 } from 'lucide-react';
import { Property } from '@/types';

const Properties: React.FC = () => {
  const {
    data: properties,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
    isStale,
    isFetching
  } = useProperties();
  const { data: agents } = useAgents();
  const [searchParams, setSearchParams] = useState({
    location: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    bedrooms: undefined as number | undefined
  });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PROPERTIES_PER_PAGE = 9; // 3 rows × 3 columns

  // Use useMemo to filter properties efficiently
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter(property => {
      // Filter by location
      if (searchParams.location && !property.location.toLowerCase().includes(searchParams.location.toLowerCase())) {
        return false;
      }

      // Filter by min price
      if (searchParams.minPrice && property.price < searchParams.minPrice) {
        return false;
      }

      // Filter by max price
      if (searchParams.maxPrice && property.price > searchParams.maxPrice) {
        return false;
      }

      // Filter by bedrooms
      if (searchParams.bedrooms && property.bedrooms < searchParams.bedrooms) {
        return false;
      }

      return true;
    });
  }, [properties, searchParams]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);
  
  const handleSearch = (params: any) => {
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced header component
  const PropertiesHeader = () => (
    <section className="relative py-24 overflow-hidden bg-gradient-luxury">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gold-whisper rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gold-accent rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-gold-light rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-16 left-10 animate-float">
        <div className="luxury-card p-3 rounded-full shadow-gold">
          <Building className="w-5 h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute top-20 right-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="luxury-card p-3 rounded-full shadow-gold">
          <MapPin className="w-5 h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="absolute bottom-16 right-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="luxury-card p-3 rounded-full shadow-gold">
          <TrendingUp className="w-5 h-5 text-gold-whisper" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold-whisper animate-glow" />
            <span className="text-xs sm:text-sm uppercase tracking-widest mx-3 sm:mx-4 font-medium text-gold-whisper">Premium Collection</span>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold-whisper animate-glow" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin mb-4 sm:mb-6 tracking-wide animate-fade-in-up" style={{ color: 'hsl(var(--deep-charcoal))' }}>
            Luxury Properties
          </h1>

          <div className="flex items-center justify-center mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 sm:w-16 h-px bg-gold-whisper"></div>
            <Building className="w-4 h-4 sm:w-6 sm:h-6 text-gold-whisper mx-3 sm:mx-4" />
            <div className="w-12 sm:w-16 h-px bg-gold-whisper"></div>
          </div>

          <p className="text-base sm:text-lg lg:text-xl font-light max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s', color: 'hsl(var(--deep-charcoal))' }}>
            Discover Kenya's finest real estate offerings
            <span className="block mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg opacity-80">Curated for the discerning buyer</span>
          </p>

          {/* Stats section */}
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin mb-1 sm:mb-2" style={{ color: 'hsl(var(--deep-charcoal))' }}>{properties?.length || 0}</div>
              <div className="text-xs sm:text-sm uppercase tracking-wider opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin mb-1 sm:mb-2" style={{ color: 'hsl(var(--deep-charcoal))' }}>15+</div>
              <div className="text-xs sm:text-sm uppercase tracking-wider opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-thin mb-1 sm:mb-2" style={{ color: 'hsl(var(--deep-charcoal))' }}>100%</div>
              <div className="text-xs sm:text-sm uppercase tracking-wider opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>Premium</div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <PropertySearch onSearch={handleSearch} />
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pure-white">
        <PropertiesHeader />
        <div className="container mx-auto px-6 py-16">
          {/* Enhanced loading state with skeleton */}
          <div className="mb-12">
            <div className="luxury-card p-8 rounded-2xl shadow-luxury animate-pulse">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold-whisper/20 rounded-lg"></div>
                    <div className="h-8 bg-satin-silver/30 rounded w-48"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-gold-whisper/20 rounded w-16"></div>
                    <div className="h-6 bg-satin-silver/30 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 bg-satin-silver/30 rounded w-32"></div>
                  <div className="h-10 bg-satin-silver/30 rounded w-40"></div>
                </div>
              </div>
            </div>
          </div>

          <PropertyGridSkeleton count={9} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-pure-white">
        <PropertiesHeader />
        <div className="container mx-auto px-6 py-16">
          <ErrorState
            message="Error loading properties"
            error={error}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-white">
      <PropertiesHeader />

      <div className="container mx-auto px-6 py-16">
        {/* Enhanced results header */}
        <div className="mb-12">
          <div className="luxury-card p-8 rounded-2xl shadow-luxury">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-lg">
                    <Grid3X3 className="w-5 h-5 text-pure-white" />
                  </div>
                  <h2 className="text-3xl font-thin tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                    Search Results
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-lg">
                  <span className="font-medium text-gold-whisper">
                    {filteredProperties.length}
                  </span>
                  <span style={{ color: 'hsl(var(--deep-charcoal))' }}>
                    {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
                  </span>
                </div>

                {totalPages > 1 && (
                  <p className="text-sm mt-2 opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <DataStatus
                  lastUpdated={dataUpdatedAt}
                  isStale={isStale}
                  isFetching={isFetching}
                  onRefresh={() => refetch()}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-soft-ivory rounded-lg">
                  <Filter className="w-4 h-4 text-gold-whisper" />
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                    {Object.values(searchParams).filter(Boolean).length} Active Filters
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredProperties.length > 0 ? (
          <>
            <PropertyGrid properties={currentProperties} agents={agents || []} />

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-16">
                <div className="luxury-card p-8 rounded-2xl shadow-luxury">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    {/* Pagination Info */}
                    <div className="text-center sm:text-left">
                      <p className="text-sm opacity-70 mb-1" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
                      </p>
                      <p className="text-lg font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-3">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="group luxury-button-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                          if (endPage - startPage + 1 < maxVisible) {
                            startPage = Math.max(1, endPage - maxVisible + 1);
                          }

                          // First page
                          if (startPage > 1) {
                            pages.push(
                              <Button
                                key={1}
                                variant="outline"
                                onClick={() => handlePageChange(1)}
                                className="luxury-button-secondary w-12 h-12"
                                size="sm"
                              >
                                1
                              </Button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span key="ellipsis1" className="px-2 text-deep-charcoal/50">...</span>
                              );
                            }
                          }

                          // Visible pages
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                onClick={() => handlePageChange(i)}
                                className={`w-12 h-12 transition-all duration-300 ${
                                  currentPage === i
                                    ? "luxury-button-primary shadow-gold"
                                    : "luxury-button-secondary hover:shadow-md"
                                }`}
                                size="sm"
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Last page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span key="ellipsis2" className="px-2 text-deep-charcoal/50">...</span>
                              );
                            }
                            pages.push(
                              <Button
                                key={totalPages}
                                variant="outline"
                                onClick={() => handlePageChange(totalPages)}
                                className="luxury-button-secondary w-12 h-12"
                                size="sm"
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pages;
                        })()}
                      </div>

                      {/* Next Button */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="group luxury-button-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Jump */}
                  {totalPages > 10 && (
                    <div className="mt-6 pt-6 border-t border-satin-silver/20 flex items-center justify-center gap-3">
                      <span className="text-sm" style={{ color: 'hsl(var(--deep-charcoal))' }}>Jump to page:</span>
                      <select
                        value={currentPage}
                        onChange={(e) => handlePageChange(parseInt(e.target.value))}
                        className="px-3 py-2 border border-satin-silver rounded-lg bg-pure-white text-deep-charcoal focus:border-gold-whisper focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-300"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            Page {page}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="luxury-card p-16 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
                <Building className="w-12 h-12 text-pure-white" />
              </div>
              <h3 className="text-3xl font-thin mb-4 tracking-wide" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                No Properties Found
              </h3>
              <p className="text-lg opacity-70 mb-8 leading-relaxed" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                We couldn't find any properties matching your search criteria.
                <span className="block mt-2">Try adjusting your filters for more results.</span>
              </p>

              {/* Suggestions */}
              <div className="space-y-4 mb-8">
                <p className="text-sm font-medium opacity-80" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                  Suggestions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-soft-ivory rounded-lg">
                    <MapPin className="w-4 h-4 text-gold-whisper flex-shrink-0" />
                    <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Try a different location</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-soft-ivory rounded-lg">
                    <DollarSign className="w-4 h-4 text-gold-whisper flex-shrink-0" />
                    <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Adjust your price range</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-soft-ivory rounded-lg">
                    <Bed className="w-4 h-4 text-gold-whisper flex-shrink-0" />
                    <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Change bedroom requirements</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-soft-ivory rounded-lg">
                    <Filter className="w-4 h-4 text-gold-whisper flex-shrink-0" />
                    <span style={{ color: 'hsl(var(--deep-charcoal))' }}>Clear all filters</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSearchParams({
                    location: '',
                    minPrice: undefined,
                    maxPrice: undefined,
                    bedrooms: undefined
                  });
                  setCurrentPage(1);
                }}
                className="luxury-button-primary px-8 py-3"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
