
import React, { useState, useMemo } from 'react';
import PropertyGrid from '@/components/properties/PropertyGrid';
import PropertySearch from '@/components/properties/PropertySearch';
import { useProperties } from '@/hooks/useData';
import { useAgents } from '@/hooks/useData';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/loading';
import { DataStatus } from '@/components/ui/data-status';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pure-white">
        <div className="bg-deep-charcoal py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h1 className="hero-text text-4xl font-thin mb-2 luxury-heading tracking-wide">Luxury Properties</h1>
              <p className="hero-text text-xl font-light">Discover Kenya's finest real estate offerings</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-16">
          <LoadingState message="Loading properties..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-pure-white">
        <div className="bg-deep-charcoal py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h1 className="hero-text text-4xl font-thin mb-2 luxury-heading tracking-wide">Luxury Properties</h1>
              <p className="hero-text text-xl font-light">Discover Kenya's finest real estate offerings</p>
            </div>
          </div>
        </div>
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
      <div className="bg-deep-charcoal py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="hero-text text-4xl font-thin mb-2 luxury-heading tracking-wide">Luxury Properties</h1>
            <p className="hero-text text-xl font-light">Discover Kenya's finest real estate offerings</p>
          </div>
          <PropertySearch onSearch={handleSearch} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-thin text-deep-charcoal luxury-heading tracking-wide">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
            </h2>
            {totalPages > 1 && (
              <p className="text-sm luxury-text mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length}
              </p>
            )}
          </div>
          <DataStatus
            lastUpdated={dataUpdatedAt}
            isStale={isStale}
            isFetching={isFetching}
            onRefresh={() => refetch()}
          />
        </div>

        {filteredProperties.length > 0 ? (
          <>
            <PropertyGrid properties={currentProperties} agents={agents || []} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="luxury-button-secondary"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? "luxury-button-primary" : "luxury-button-secondary"}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="luxury-button-secondary"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            message="No properties match your search criteria"
            description="Try adjusting your filters for more results."
          />
        )}
      </div>
    </div>
  );
};

export default Properties;
