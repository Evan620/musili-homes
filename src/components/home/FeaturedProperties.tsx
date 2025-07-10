
import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProperties } from '@/hooks/useData';
import PropertyCard from '@/components/properties/PropertyCard';
import { useAgents } from '@/hooks/useAgents';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/loading';

const FeaturedProperties: React.FC = () => {
  const { data: featuredProperties, isLoading, isError, error, refetch } = useFeaturedProperties();
  const { data: agents } = useAgents();


  if (isLoading) {
    return (
      <section className="py-32 bg-pure-white">
        <div className="container mx-auto px-6">
          <LoadingState message="Loading featured properties..." />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-32 bg-pure-white">
        <div className="container mx-auto px-6">
          <ErrorState
            message="Error loading featured properties"
            error={error}
            onRetry={() => refetch()}
          />
        </div>
      </section>
    );
  }

  if (!featuredProperties || featuredProperties.length === 0) {
    return (
      <section className="py-32 bg-pure-white">
        <div className="container mx-auto px-6">
          <EmptyState
            message="No featured properties available"
            description="Check back later for new featured listings."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 bg-pure-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-thin luxury-heading mb-6 tracking-wide">Featured Collection</h2>
          <div className="w-24 h-px bg-gold-whisper mx-auto mb-8"></div>
          <p className="text-xl luxury-text max-w-2xl mx-auto leading-relaxed">
            Handpicked selections from Kenya's most exceptional properties
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {featuredProperties.map((property) => {
            const agent = agents?.find(a => a.id === property.agent_id);
            return <PropertyCard key={property.id} property={property} agent={agent} />;
          })}
        </div>
        
        <div className="text-center mt-20">
          <Link 
            to="/properties"
            className="inline-block luxury-button-secondary px-12 py-4 font-light tracking-wide"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
