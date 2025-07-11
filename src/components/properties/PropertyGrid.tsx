
import React, { useState } from 'react';
import { Property, Agent } from '@/types';
import PropertyCard from './PropertyCard';
import { Grid3X3, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyGridProps {
  properties: Property[];
  agents: Agent[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, agents }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort properties based on selected criteria
  const sortedProperties = [...properties].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (newSortBy: 'price' | 'date' | 'name') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Controls */}
      <div className="luxury-card p-6 rounded-xl shadow-luxury">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium mr-3" style={{ color: 'hsl(var(--deep-charcoal))' }}>View:</span>
            <div className="flex bg-soft-ivory rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gold-whisper text-pure-white shadow-md'
                    : 'text-deep-charcoal hover:bg-pearl-silver'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gold-whisper text-pure-white shadow-md'
                    : 'text-deep-charcoal hover:bg-pearl-silver'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'date', label: 'Latest' },
                { key: 'price', label: 'Price' },
                { key: 'name', label: 'Name' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort(key as 'price' | 'date' | 'name')}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    sortBy === key
                      ? 'bg-gold-whisper/10 border-gold-whisper text-gold-whisper'
                      : 'hover:bg-soft-ivory'
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid/List */}
      <div className={`${
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10'
          : 'space-y-6'
      }`}>
        {sortedProperties.map((property, index) => {
          const agent = agents.find(a => a.id === property.agent_id);
          return (
            <div
              key={property.id}
              className="animate-fade-in-up hover-lift"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              <PropertyCard
                property={property}
                agent={agent}
                viewMode={viewMode}
              />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="text-center py-16">
          <div className="luxury-card p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-gold-whisper to-gold-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="w-8 h-8 text-pure-white" />
            </div>
            <h3 className="text-xl font-medium mb-3" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              No Properties Found
            </h3>
            <p className="opacity-70" style={{ color: 'hsl(var(--deep-charcoal))' }}>
              Try adjusting your search filters to find more properties.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;
