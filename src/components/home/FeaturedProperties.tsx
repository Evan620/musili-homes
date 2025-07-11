
import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProperties } from '@/hooks/useData';
import PropertyCard from '@/components/properties/PropertyCard';
import { useAgents } from '@/hooks/useAgents';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/loading';
import { ArrowRight, Star, TrendingUp, Award } from 'lucide-react';

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
    <section className="py-32 bg-gradient-luxury-warm relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Star className="w-32 h-32 text-gold-whisper animate-float" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <Award className="w-24 h-24 text-gold-whisper animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced header section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-gold-whisper animate-glow" />
              <span className="text-sm uppercase tracking-widest text-gold-whisper font-medium">Premium Selection</span>
              <TrendingUp className="w-8 h-8 text-gold-whisper animate-glow" />
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-thin luxury-heading mb-6 tracking-wide animate-fade-in-up">
            Featured Collection
          </h2>

          <div className="flex items-center justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-px bg-gold-whisper"></div>
            <Star className="w-6 h-6 text-gold-whisper mx-4 animate-glow" />
            <div className="w-16 h-px bg-gold-whisper"></div>
          </div>

          <p className="text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s', color: 'hsl(var(--deep-charcoal))', fontWeight: '300' }}>
            Handpicked selections from Kenya's most exceptional properties,
            <span className="block mt-2 text-lg">curated for the discerning buyer</span>
          </p>
        </div>

        {/* Enhanced property grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {featuredProperties.map((property, index) => {
            const agent = agents?.find(a => a.id === property.agent_id);
            return (
              <div
                key={property.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <PropertyCard property={property} agent={agent} />
              </div>
            );
          })}
        </div>

        {/* Enhanced CTA section */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="max-w-md mx-auto">
            <p className="mb-6 font-light opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              Discover more exceptional properties in our complete collection
            </p>
            <Link
              to="/properties"
              className="group inline-flex items-center gap-3 luxury-button-primary px-12 py-4 font-light tracking-wide"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
