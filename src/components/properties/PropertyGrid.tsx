
import React from 'react';
import { Property, Agent } from '@/types';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  agents: Agent[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, agents }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property) => {
        const agent = agents.find(a => a.id === property.agent_id);
        return <PropertyCard key={property.id} property={property} agent={agent} />;
      })}
    </div>
  );
};

export default PropertyGrid;
