import { supabase } from '@/integrations/supabase/client';
import { Property, Agent, Task } from '@/types';

export interface CompanyInfo {
  name: string;
  description: string;
  services: string[];
  locations: string[];
  specialties: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface PropertyStats {
  totalProperties: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  locationCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  bedroomCounts: Record<number, number>;
}

export interface AgentStats {
  totalAgents: number;
  agentsWithProperties: number;
  averagePropertiesPerAgent: number;
}

export interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
}

export class AIDatabaseService {
  // Helper function to transform database property data to Property interface
  private transformProperty(item: any): Property {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      location: item.location,
      address: item.address,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      size: item.size,
      images: item.property_images?.map((img: any) => ({
        id: img.id || 0,
        property_id: item.id,
        image_url: img.image_url
      })) || [],
      featured: item.featured,
      status: item.status,
      created_at: item.created_at,
      agent_id: item.agent_id
    };
  }

  // Helper function to transform database agent data to Agent interface
  private transformAgent(item: any): Agent {
    return {
      id: item.id,
      name: item.users?.name || 'Unknown Agent',
      email: item.users?.email || '',
      phone: item.users?.phone || '',
      photo: item.users?.photo || '',
      bio: item.bio || '',
      role: 'agent'
    };
  }

  // Helper function to transform user data to Agent interface
  private transformAgentFromUser(user: any, bio: string = ''): Agent {
    return {
      id: user.id,
      name: user.name || 'Unknown Agent',
      email: user.email || '',
      phone: user.phone || '',
      photo: user.photo || '',
      bio: bio,
      role: 'agent'
    };
  }

  // Helper function to transform database task data to Task interface
  private transformTask(item: any): Task {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: item.status,
      due_date: item.due_date, // Use due_date consistently
      agent_id: item.agent_id,
      created_at: item.created_at
    };
  }

  // Company Information
  getCompanyInfo(): CompanyInfo {
    return {
      name: "Musilli Homes",
      description: "Kenya's premier luxury real estate company, dedicated to providing exceptional real estate experiences for discerning clients seeking the most prestigious properties.",
      services: [
        "Luxury Property Sales",
        "Premium Property Rentals", 
        "Property Investment Consulting",
        "Property Management Services",
        "Market Analysis & Valuation",
        "Exclusive Property Viewings",
        "Investment Portfolio Development",
        "Property Marketing & Promotion"
      ],
      locations: [
        "Nairobi - Westlands, Karen, Kilimani, Lavington",
        "Naivasha - Lake View Estates, Moi South Lake Road",
        "Mombasa - Nyali, Diani Beach",
        "Nakuru - Milimani, Section 58",
        "Kisumu - Milimani, Tom Mboya Estate"
      ],
      specialties: [
        "Lakefront Villas",
        "Urban Penthouses", 
        "Colonial Estates",
        "Modern Apartments",
        "Investment Properties",
        "Commercial Real Estate"
      ],
      contactInfo: {
        phone: "+254 700 123 456",
        email: "info@musillihomes.co.ke",
        address: "Musilli Homes Tower, Westlands, Nairobi, Kenya"
      }
    };
  }

  // Property Data with Enhanced Real-time Access
  async getAllProperties(): Promise<Property[]> {
    try {
      console.log('🔍 AIDatabaseService: Fetching all properties with complete data...');

      // Skip complex join query and use fallback directly to avoid 406 errors
      console.log('🔄 AIDatabaseService: Using simple query approach to avoid foreign key issues');
      return await this.getAllPropertiesSimple();
    } catch (error) {
      console.error('🚨 AIDatabaseService: Error fetching properties:', error);
      // Return fallback data if available
      return await this.getAllPropertiesSimple();
    }
  }

  // Fallback method for simple property data access
  async getAllPropertiesSimple(): Promise<Property[]> {
    try {
      console.log('🔄 AIDatabaseService: Using simple property query fallback...');

      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propError) {
        console.error('🚨 AIDatabaseService: Simple query failed:', propError);
        return [];
      }

      if (!properties || properties.length === 0) {
        return [];
      }

      // Get images separately
      const propertyIds = properties.map(p => p.id);
      const { data: images } = await supabase
        .from('property_images')
        .select('property_id, image_url')
        .in('property_id', propertyIds);

      // Get agent data separately
      const agentIds = properties
        .map(p => p.agent_id)
        .filter(id => id !== null && id !== undefined);

      const { data: agents } = await supabase
        .from('users')
        .select('id, name, email, phone')
        .eq('role', 'agent')
        .in('id', agentIds);

      // Transform and combine data
      return properties.map(property => {
        const propertyImages = images?.filter(img => img.property_id === property.id) || [];
        const agent = agents?.find(a => a.id === property.agent_id);

        return {
          id: property.id,
          title: property.title || '',
          description: property.description || '',
          price: property.price || 0,
          location: property.location || '',
          address: property.address || '',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          size: property.size || 0,
          featured: property.featured || false,
          status: property.status || 'For Sale',
          agent_id: property.agent_id || 0,
          images: propertyImages.map(img => img.image_url),
          agent: agent ? {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone || ''
          } : undefined,
          createdAt: property.created_at || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('🚨 AIDatabaseService: Fallback query failed:', error);
      return [];
    }
  }

  async getPropertiesByLocation(location: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .ilike('location', `%${location}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching properties by location:', error);
      return [];
    }
  }

  async getPropertiesByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .order('price', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching properties by price range:', error);
      return [];
    }
  }

  async getPropertiesByBedrooms(bedrooms: number): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .eq('bedrooms', bedrooms)
        .order('price', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching properties by bedrooms:', error);
      return [];
    }
  }

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  async getPropertyStats(): Promise<PropertyStats> {
    try {
      const properties = await this.getAllProperties();
      
      if (properties.length === 0) {
        return {
          totalProperties: 0,
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          locationCounts: {},
          statusCounts: {},
          bedroomCounts: {}
        };
      }

      const prices = properties.map(p => p.price);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const locationCounts: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};
      const bedroomCounts: Record<number, number> = {};

      properties.forEach(property => {
        // Count by location
        locationCounts[property.location] = (locationCounts[property.location] || 0) + 1;
        
        // Count by status
        statusCounts[property.status] = (statusCounts[property.status] || 0) + 1;
        
        // Count by bedrooms
        bedroomCounts[property.bedrooms] = (bedroomCounts[property.bedrooms] || 0) + 1;
      });

      return {
        totalProperties: properties.length,
        averagePrice,
        priceRange: { min: minPrice, max: maxPrice },
        locationCounts,
        statusCounts,
        bedroomCounts
      };
    } catch (error) {
      console.error('Error calculating property stats:', error);
      return {
        totalProperties: 0,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        locationCounts: {},
        statusCounts: {},
        bedroomCounts: {}
      };
    }
  }

  // Agent Data
  async getAllAgents(): Promise<Agent[]> {
    try {
      console.log('🔍 AIDatabaseService: Fetching all agents...');

      // Use simpler approach: fetch users with role 'agent' and get bio separately
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'agent')
        .order('id', { ascending: true });

      if (userError) {
        console.error('🚨 AIDatabaseService: Supabase error fetching agent users:', userError);
        // Try fallback approach
        return [];
      }

      console.log('📊 AIDatabaseService: Raw agent users data:', users);
      console.log('📊 AIDatabaseService: Agent users count:', users?.length || 0);

      if (!users || users.length === 0) {
        console.log('📭 AIDatabaseService: No agents found');
        return [];
      }

      // Get bio data for all agents
      const agentIds = users.map(user => user.id);
      const { data: agentData } = await supabase
        .from('agents')
        .select('id, bio')
        .in('id', agentIds);

      const transformedAgents = users.map(user => {
        const agentBio = agentData?.find(agent => agent.id === user.id);
        return this.transformAgentFromUser(user, agentBio?.bio || '');
      });

      console.log('✅ AIDatabaseService: Transformed agents:', transformedAgents.length);
      return transformedAgents;
    } catch (error) {
      console.error('🚨 AIDatabaseService: Error fetching agents:', error);
      return [];
    }
  }

  async getAgentStats(): Promise<AgentStats> {
    try {
      const agents = await this.getAllAgents();
      const properties = await this.getAllProperties();
      
      const agentsWithProperties = new Set(properties.map(p => p.agent_id)).size;
      const averagePropertiesPerAgent = agents.length > 0 ? properties.length / agents.length : 0;

      return {
        totalAgents: agents.length,
        agentsWithProperties,
        averagePropertiesPerAgent
      };
    } catch (error) {
      console.error('Error calculating agent stats:', error);
      return {
        totalAgents: 0,
        agentsWithProperties: 0,
        averagePropertiesPerAgent: 0
      };
    }
  }

  // Task Data
  async getAllTasks(): Promise<Task[]> {
    try {
      console.log('🔍 AIDatabaseService: Fetching all tasks...');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          agents (
            id,
            users (name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🚨 AIDatabaseService: Supabase error fetching tasks:', error);
        throw error;
      }

      console.log('📊 AIDatabaseService: Raw tasks data:', data);
      console.log('📊 AIDatabaseService: Tasks count:', data?.length || 0);

      const transformedTasks = (data || []).map(item => this.transformTask(item));
      console.log('✅ AIDatabaseService: Transformed tasks:', transformedTasks.length);

      return transformedTasks;
    } catch (error) {
      console.error('🚨 AIDatabaseService: Error fetching tasks:', error);
      return [];
    }
  }

  async getTaskStats(): Promise<TaskStats> {
    try {
      const tasks = await this.getAllTasks();
      
      const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const highPriorityTasks = tasks.filter(t => t.priority === 'High').length;

      return {
        totalTasks: tasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        highPriorityTasks
      };
    } catch (error) {
      console.error('Error calculating task stats:', error);
      return {
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        highPriorityTasks: 0
      };
    }
  }

  // Search and Filter Methods
  async searchProperties(query: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,address.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }

  // Advanced Query Methods
  async getPropertiesByStatus(status: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching properties by status:', error);
      return [];
    }
  }

  async getAgentProperties(agentId: number): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (image_url),
          agents:agents!properties_agent_auth_id_fkey (
            id,
            users:users!agents_user_auth_id_fkey (
              name, email, phone
            )
          )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.transformProperty(item));
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      return [];
    }
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          agents (
            id,
            users (name, email)
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.transformTask(item));
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      return [];
    }
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          agents (
            id,
            users (name, email)
          )
        `)
        .eq('priority', priority)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.transformTask(item));
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      return [];
    }
  }

  async getAgentTasks(agentId: number): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          agents (
            id,
            users (name, email)
          )
        `)
        .eq('agent_id', agentId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.transformTask(item));
    } catch (error) {
      console.error('Error fetching agent tasks:', error);
      return [];
    }
  }

  // Business Analytics Methods
  async getPropertyAnalytics(): Promise<{
    totalValue: number;
    averagePriceByLocation: Record<string, number>;
    salesTrends: Record<string, number>;
    topPerformingAgents: Array<{agentId: number; agentName: string; propertyCount: number; totalValue: number}>;
  }> {
    try {
      const properties = await this.getAllProperties();
      const agents = await this.getAllAgents();

      const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

      // Calculate average price by location
      const locationGroups: Record<string, number[]> = {};
      properties.forEach(p => {
        if (!locationGroups[p.location]) locationGroups[p.location] = [];
        locationGroups[p.location].push(p.price);
      });

      const averagePriceByLocation: Record<string, number> = {};
      Object.entries(locationGroups).forEach(([location, prices]) => {
        averagePriceByLocation[location] = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      });

      // Calculate top performing agents
      const agentPerformance: Record<number, {propertyCount: number; totalValue: number; name: string}> = {};
      properties.forEach(p => {
        if (!agentPerformance[p.agent_id]) {
          const agent = agents.find(a => a.id === p.agent_id);
          agentPerformance[p.agent_id] = {
            propertyCount: 0,
            totalValue: 0,
            name: agent?.name || 'Unknown Agent'
          };
        }
        agentPerformance[p.agent_id].propertyCount++;
        agentPerformance[p.agent_id].totalValue += p.price;
      });

      const topPerformingAgents = Object.entries(agentPerformance)
        .map(([agentId, data]) => ({
          agentId: parseInt(agentId),
          agentName: data.name,
          propertyCount: data.propertyCount,
          totalValue: data.totalValue
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

      return {
        totalValue,
        averagePriceByLocation,
        salesTrends: {}, // Could be enhanced with time-based data
        topPerformingAgents
      };
    } catch (error) {
      console.error('Error calculating property analytics:', error);
      return {
        totalValue: 0,
        averagePriceByLocation: {},
        salesTrends: {},
        topPerformingAgents: []
      };
    }
  }

  async getAvailabilityReport(): Promise<{
    availableForSale: number;
    availableForRent: number;
    sold: number;
    rented: number;
    totalInventory: number;
    availabilityByLocation: Record<string, {forSale: number; forRent: number}>;
  }> {
    try {
      const properties = await this.getAllProperties();

      const availableForSale = properties.filter(p => p.status === 'For Sale').length;
      const availableForRent = properties.filter(p => p.status === 'For Rent').length;
      const sold = properties.filter(p => p.status === 'Sold').length;
      const rented = properties.filter(p => p.status === 'Rented').length;

      const availabilityByLocation: Record<string, {forSale: number; forRent: number}> = {};
      properties.forEach(p => {
        if (!availabilityByLocation[p.location]) {
          availabilityByLocation[p.location] = {forSale: 0, forRent: 0};
        }
        if (p.status === 'For Sale') availabilityByLocation[p.location].forSale++;
        if (p.status === 'For Rent') availabilityByLocation[p.location].forRent++;
      });

      return {
        availableForSale,
        availableForRent,
        sold,
        rented,
        totalInventory: properties.length,
        availabilityByLocation
      };
    } catch (error) {
      console.error('Error generating availability report:', error);
      return {
        availableForSale: 0,
        availableForRent: 0,
        sold: 0,
        rented: 0,
        totalInventory: 0,
        availabilityByLocation: {}
      };
    }
  }
}

export const aiDatabaseService = new AIDatabaseService();
