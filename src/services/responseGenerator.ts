import { properties } from '@/data/properties';
import { agents } from '@/data/agents';

interface ResponseContext {
  intent: any;
  userMessage: string;
  conversationHistory: any[];
  userPreferences?: Record<string, any>;
}

export class ResponseGenerator {
  generateDynamicResponse(context: ResponseContext): string {
    const { intent, userMessage } = context;
    
    switch (intent.type) {
      case 'greeting':
        return this.generateGreetingResponse();
      
      case 'property_search':
        return this.generatePropertySearchResponse(intent.entities);
      
      case 'property_info':
        return this.generatePropertyInfoResponse(intent.entities);
      
      case 'price_inquiry':
        return this.generatePriceResponse(intent.entities);
      
      case 'location_inquiry':
        return this.generateLocationResponse(intent.entities);
      
      case 'viewing_request':
        return this.generateViewingResponse(intent.entities);
      
      default:
        return this.generateGeneralResponse(userMessage, intent.entities);
    }
  }

  private generateGreetingResponse(): string {
    const greetings = [
      "Hello! I'm your AI Property Assistant. I'm here to help you discover the perfect luxury property that matches your needs.",
      "Hi there! Welcome to our luxury property showcase. I can help you explore our exclusive collection of premium properties.",
      "Good day! I'm excited to help you find your dream property. What kind of luxury home are you looking for today?"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    return `${randomGreeting}\n\nI can assist you with:\n• Detailed property information and virtual tours\n• Pricing and investment analysis\n• Location insights and neighborhood details\n• Scheduling personal property viewings\n\nWhat would you like to explore first?`;
  }

  private generatePropertySearchResponse(entities: Record<string, any>): string {
    let filters = this.buildSearchFilters(entities);
    let matchedProperties = this.searchProperties(filters);
    
    if (matchedProperties.length === 0) {
      return this.generateNoResultsResponse(filters);
    }
    
    if (matchedProperties.length === 1) {
      return this.generateSinglePropertyResponse(matchedProperties[0]);
    }
    
    return this.generateMultiplePropertyResponse(matchedProperties, filters);
  }

  private generatePropertyInfoResponse(entities: Record<string, any>): string {
    const propertyName = entities.property_name;
    const property = this.findPropertyByName(propertyName);
    
    if (!property) {
      return `I couldn't find a property matching "${propertyName}". Let me show you our available luxury properties:\n\n${this.generatePropertyList()}`;
    }
    
    return this.generateDetailedPropertyInfo(property);
  }

  private generatePriceResponse(entities: Record<string, any>): string {
    const priceRange = entities.price_range;
    const location = entities.location;
    
    let filteredProperties = properties;
    
    if (priceRange) {
      filteredProperties = properties.filter(p => p.price <= priceRange * 1.2 && p.price >= priceRange * 0.8);
    }
    
    if (location) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (filteredProperties.length === 0) {
      return this.generatePriceAlternatives(priceRange, location);
    }
    
    const avgPrice = filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length;
    
    return `Based on your budget inquiry, here's what I found:\n\n**Price Analysis:**\n• Average price in your range: KES ${avgPrice.toLocaleString()}\n• Properties available: ${filteredProperties.length}\n\n${this.formatPropertyPrices(filteredProperties)}\n\nWould you like detailed information about any of these properties?`;
  }

  private generateLocationResponse(entities: Record<string, any>): string {
    const requestedLocation = entities.location;
    
    if (requestedLocation) {
      const locationProperties = properties.filter(p => 
        p.location.toLowerCase().includes(requestedLocation.toLowerCase())
      );
      
      if (locationProperties.length === 0) {
        return `I don't currently have properties in ${requestedLocation}, but let me show you our premium locations:\n\n${this.generateLocationOverview()}`;
      }
      
      return this.generateLocationSpecificResponse(requestedLocation, locationProperties);
    }
    
    return this.generateLocationOverview();
  }

  private generateViewingResponse(entities: Record<string, any>): string {
    const propertyName = entities.property_name;
    
    if (propertyName) {
      const property = this.findPropertyByName(propertyName);
      if (property) {
        return `Excellent choice! The **${property.title}** is truly spectacular. To arrange your private viewing, I'll need to collect some details:\n\n**Property:** ${property.title}\n**Location:** ${property.address}\n**Price:** KES ${property.price.toLocaleString()}\n\nCould you please provide:\n• Your name\n• Contact number\n• Preferred viewing date and time\n\nI'll coordinate directly with our property specialist to ensure everything is perfectly arranged for your visit.`;
      }
    }
    
    return `I'd be delighted to help you schedule a property viewing! First, could you let me know which property interests you? I can then provide detailed viewing information and coordinate with our property specialists.`;
  }

  private generateGeneralResponse(userMessage: string, entities: Record<string, any>): string {
    const responses = [
      `I understand you're interested in our luxury properties. Let me help you find exactly what you're looking for.`,
      `That's a great question! Let me provide you with detailed information about our premium property collection.`,
      `I'm here to assist you with all your luxury property needs. What specific aspect would you like to explore?`
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${baseResponse}\n\nI can help you with:\n• **Property Search** - Find homes by location, price, or features\n• **Detailed Information** - Get comprehensive property details\n• **Investment Analysis** - Understand market value and potential\n• **Personal Viewings** - Schedule exclusive property tours\n\nWhat interests you most about our luxury property collection?`;
  }

  private buildSearchFilters(entities: Record<string, any>): Record<string, any> {
    const filters: Record<string, any> = {};
    
    if (entities.location) filters.location = entities.location;
    if (entities.bedrooms) filters.bedrooms = entities.bedrooms;
    if (entities.price_range) filters.maxPrice = entities.price_range;
    
    return filters;
  }

  private searchProperties(filters: Record<string, any>) {
    return properties.filter(property => {
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.bedrooms && property.bedrooms !== filters.bedrooms) {
        return false;
      }
      if (filters.maxPrice && property.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }

  private findPropertyByName(name: string) {
    return properties.find(p => 
      p.title.toLowerCase().includes(name.toLowerCase()) ||
      this.fuzzyMatch(p.title.toLowerCase(), name.toLowerCase(), 0.6)
    );
  }

  private fuzzyMatch(text: string, target: string, threshold: number): boolean {
    const words = target.split(' ');
    const matchedWords = words.filter(word => text.includes(word));
    return (matchedWords.length / words.length) >= threshold;
  }

  private generateDetailedPropertyInfo(property: any): string {
    const agent = agents.find(a => a.id === property.agentId);
    
    return `**${property.title}** - Exceptional Luxury Property\n\n**Property Details:**\n• **Location:** ${property.location}\n• **Address:** ${property.address}\n• **Price:** KES ${property.price.toLocaleString()}\n• **Bedrooms:** ${property.bedrooms}\n• **Bathrooms:** ${property.bathrooms}\n• **Size:** ${property.size.toLocaleString()} sq ft\n• **Status:** ${property.status}\n\n**Description:**\n${property.description}\n\n**Property Specialist:** ${agent?.name || 'Available'}\n**Direct Contact:** ${agent?.phone || 'Available'}\n\nThis property represents exceptional value in one of our most prestigious locations. Would you like to schedule a private viewing to experience this luxury home firsthand?`;
  }

  private generatePropertyList(): string {
    return properties.map(p => 
      `• **${p.title}** in ${p.location} - ${p.bedrooms} bed, KES ${p.price.toLocaleString()}`
    ).join('\n');
  }

  private formatPropertyPrices(props: any[]): string {
    return props.map(p => 
      `• **${p.title}** - KES ${p.price.toLocaleString()} (${p.location})`
    ).join('\n');
  }

  private generateLocationOverview(): string {
    const locations = [...new Set(properties.map(p => p.location))];
    
    return locations.map(location => {
      const locationProps = properties.filter(p => p.location === location);
      const avgPrice = locationProps.reduce((sum, p) => sum + p.price, 0) / locationProps.length;
      
      return `**${location}:**\n• ${locationProps.length} luxury properties available\n• Average price: KES ${avgPrice.toLocaleString()}\n• Featured: ${locationProps[0].title}`;
    }).join('\n\n');
  }

  private generateLocationSpecificResponse(location: string, properties: any[]): string {
    const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
    
    return `**Luxury Properties in ${location}:**\n\n• **${properties.length} exclusive properties** available\n• **Average price:** KES ${avgPrice.toLocaleString()}\n• **Price range:** KES ${Math.min(...properties.map(p => p.price)).toLocaleString()} - KES ${Math.max(...properties.map(p => p.price)).toLocaleString()}\n\n**Available Properties:**\n${properties.map(p => `• **${p.title}** - ${p.bedrooms} bed, KES ${p.price.toLocaleString()}`).join('\n')}\n\nWhich property would you like to explore in detail?`;
  }

  private generateNoResultsResponse(filters: Record<string, any>): string {
    return `I couldn't find properties matching your exact criteria, but let me suggest some alternatives:\n\n${this.generateAlternativeSuggestions(filters)}\n\nWould you like to adjust your search criteria or explore these recommendations?`;
  }

  private generateAlternativeSuggestions(filters: Record<string, any>): string {
    // Generate intelligent alternatives based on filters
    return this.generatePropertyList();
  }

  private generateSinglePropertyResponse(property: any): string {
    return `Perfect! I found exactly what you're looking for:\n\n${this.generateDetailedPropertyInfo(property)}`;
  }

  private generateMultiplePropertyResponse(properties: any[], filters: Record<string, any>): string {
    return `Great! I found ${properties.length} luxury properties that match your criteria:\n\n${this.formatPropertyPrices(properties)}\n\nWhich property would you like to learn more about? I can provide detailed information and arrange viewings for any of these exceptional properties.`;
  }

  private generatePriceAlternatives(priceRange: number, location?: string): string {
    const alternatives = properties.filter(p => 
      Math.abs(p.price - priceRange) / priceRange < 0.5
    );
    
    return `I don't have exact matches for your budget, but here are some nearby options:\n\n${this.formatPropertyPrices(alternatives)}`;
  }
}

export const responseGenerator = new ResponseGenerator();

export const generateResponse = (type: string, context: any, state: any) => {
  return responseGenerator.generateDynamicResponse({
    intent: { type, entities: context },
    userMessage: '',
    conversationHistory: []
  });
};
