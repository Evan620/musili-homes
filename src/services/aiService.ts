
import { Property } from '@/types';
import { nlpService } from './nlpService';
import { responseGenerator } from './responseGenerator';
import { aiDatabaseService } from './aiDatabaseService';
import { companyKnowledgeBase } from './companyKnowledgeBase';
import { openRouterService } from './openRouterService';

// Define types for entities and conversation state
interface Entities {
  location?: string;
  bedrooms?: number;
  priceRange?: { min?: number; max?: number };
  date?: string;
  time?: string;
  name?: string;
  contact?: string;
  propertyType?: string;
}

interface ConversationState {
  currentStep: 'greeting' | 'property_inquiry' | 'collecting_details' | 'confirming_booking' | 'general_chat';
  propertyContext?: Property;
  viewingDetails?: {
    name?: string;
    contact?: string;
    date?: string;
    time?: string;
  };
  userPreferences?: {
    location?: string;
    priceRange?: string;
    bedrooms?: number;
    propertyType?: string;
  };
}

interface ViewingRequest {
  propertyId: string;
  clientName: string;
  clientContact: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

interface AIResponse {
  message: string;
  newState: ConversationState;
  shouldNotifyAgent?: boolean;
  viewingRequest?: ViewingRequest;
  visualType?: string;
  visualData?: any;
}

// Initialize conversation state
let conversationState: ConversationState = {
  currentStep: 'greeting'
};

export const processUserMessage = async (message: string): Promise<AIResponse> => {
  try {
    console.log('🔍 aiService: Processing user message:', message);

    // For complex queries, use OpenRouter AI with company context
    if (message.length > 50 ||
        message.toLowerCase().includes('recommend') ||
        message.toLowerCase().includes('compare') ||
        message.toLowerCase().includes('analyze') ||
        message.toLowerCase().includes('explain') ||
        message.toLowerCase().includes('why') ||
        message.toLowerCase().includes('how')) {
      console.log('🧠 aiService: Routing to complex query handler');
      return await handleComplexQuery(message);
    }

    const intent = nlpService.analyzeIntent(message);
    const entities = intent.entities;
    console.log('🎯 aiService: Intent analysis:', intent);

    // Handle greeting
    if (intent.type === 'greeting' || conversationState.currentStep === 'greeting') {
      return await handleGreeting(message);
    }

    // Handle company/business inquiries
    if (intent.type === 'general_inquiry' && (
      message.toLowerCase().includes('company') ||
      message.toLowerCase().includes('business') ||
      message.toLowerCase().includes('service') ||
      message.toLowerCase().includes('about') ||
      message.toLowerCase().includes('who are you') ||
      message.toLowerCase().includes('what do you do') ||
      message.toLowerCase().includes('musili') ||
      message.toLowerCase().includes('what is')
    )) {
      console.log('🏢 aiService: Routing to company inquiry handler');
      return await handleCompanyInquiry(message);
    }

    // Handle property inquiries with database integration
    if (intent.type === 'property_search' || intent.type === 'property_info') {
      return await handlePropertyInquiry(message, entities);
    }

    // Handle viewing requests
    if (intent.type === 'viewing_request' || conversationState.currentStep === 'collecting_details') {
      return handleViewingRequest(message, entities);
    }

    // Handle market/statistics inquiries
    if (message.toLowerCase().includes('market') ||
        message.toLowerCase().includes('statistics') ||
        message.toLowerCase().includes('stats') ||
        message.toLowerCase().includes('data')) {
      return await handleMarketInquiry(message);
    }

    // Handle availability inquiries
    if (message.toLowerCase().includes('available') ||
        message.toLowerCase().includes('availability') ||
        message.toLowerCase().includes('inventory')) {
      return await handleAvailabilityInquiry(message);
    }

    // Handle agent-related inquiries
    if (message.toLowerCase().includes('agent') ||
        message.toLowerCase().includes('staff') ||
        message.toLowerCase().includes('team')) {
      return await handleAgentInquiry(message);
    }

    // Handle task/work inquiries
    if (message.toLowerCase().includes('task') ||
        message.toLowerCase().includes('work') ||
        message.toLowerCase().includes('assignment') ||
        message.toLowerCase().includes('progress')) {
      return await handleTaskInquiry(message);
    }

    // Handle analytics inquiries
    if (message.toLowerCase().includes('analytics') ||
        message.toLowerCase().includes('performance') ||
        message.toLowerCase().includes('report') ||
        message.toLowerCase().includes('analysis')) {
      return await handleAnalyticsInquiry(message);
    }

    // For other queries, try OpenRouter AI first
    return await handleComplexQuery(message);

  } catch (error) {
    console.error('Error processing message:', error);
    return {
      message: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our team directly at +254 700 123 456.",
      newState: conversationState
    };
  }
};

// Enhanced property matching with database integration
const findMatchingProperties = async (entities: any): Promise<Property[]> => {
  try {
    let properties: Property[] = [];

    // If location is specified, search by location
    if (entities.location) {
      properties = await aiDatabaseService.getPropertiesByLocation(entities.location);
    }
    // If price range is specified
    else if (entities.price_range) {
      const priceRange = entities.price_range;
      const minPrice = priceRange * 0.8;
      const maxPrice = priceRange * 1.2;
      properties = await aiDatabaseService.getPropertiesByPriceRange(minPrice, maxPrice);
    }
    // If bedrooms are specified
    else if (entities.bedrooms) {
      properties = await aiDatabaseService.getPropertiesByBedrooms(entities.bedrooms);
    }
    // Otherwise get all properties
    else {
      properties = await aiDatabaseService.getAllProperties();
    }

    // Apply additional filters
    if (entities.location && properties.length > 0) {
      properties = properties.filter(property =>
        property.location.toLowerCase().includes(entities.location.toLowerCase())
      );
    }

    if (entities.bedrooms && properties.length > 0) {
      properties = properties.filter(property => property.bedrooms === entities.bedrooms);
    }

    if (entities.price_range && properties.length > 0) {
      const priceRange = entities.price_range;
      properties = properties.filter(property =>
        property.price <= priceRange * 1.2 && property.price >= priceRange * 0.8
      );
    }

    return properties.slice(0, 5); // Limit to top 5 results
  } catch (error) {
    console.error('Error finding matching properties:', error);
    return [];
  }
};

const handleViewingRequest = (message: string, entities: any): AIResponse => {
  const currentDetails = conversationState.viewingDetails || {};
  
  // Extract viewing details from the message
  if (!currentDetails.name && entities.name) {
    currentDetails.name = entities.name;
  }
  if (!currentDetails.contact && (entities.phone || entities.email)) {
    currentDetails.contact = entities.phone || entities.email;
  }
  if (!currentDetails.date && entities.date) {
    currentDetails.date = entities.date;
  }
  if (!currentDetails.time && entities.time) {
    currentDetails.time = entities.time;
  }

  const newState = {
    ...conversationState,
    currentStep: 'collecting_details' as const,
    viewingDetails: currentDetails
  };

  // Check if we have all required details
  if (currentDetails.name && currentDetails.contact && currentDetails.date && currentDetails.time) {
    // All details collected, ask for confirmation
    const response = `Perfect! I have all the details for your viewing:\n\n**Viewing Summary:**\n• **Property:** ${conversationState.propertyContext?.title}\n• **Name:** ${currentDetails.name}\n• **Contact:** ${currentDetails.contact}\n• **Date:** ${currentDetails.date}\n• **Time:** ${currentDetails.time}\n\nWould you like me to confirm this booking? Please reply with "Yes" to confirm or "No" to cancel.`;
    
    return {
      message: response,
      newState: { ...newState, currentStep: 'confirming_booking' }
    };
  } else {
    // Still need more details
    const missingDetails = [];
    if (!currentDetails.name) missingDetails.push("your name");
    if (!currentDetails.contact) missingDetails.push("your contact information");
    if (!currentDetails.date) missingDetails.push("your preferred date");
    if (!currentDetails.time) missingDetails.push("your preferred time");
    
    const response = `To schedule your viewing for **${conversationState.propertyContext?.title || 'this property'}**, I still need ${missingDetails.join(', ')}.\n\nPlease provide the missing information so I can arrange everything for you.`;
    
    return {
      message: response,
      newState
    };
  }
};

export const confirmViewingBooking = (): AIResponse => {
  const details = conversationState.viewingDetails;
  const property = conversationState.propertyContext;
  
  if (!details?.name || !details?.contact || !details?.date || !details?.time || !property) {
    return {
      message: "I'm sorry, but I don't have all the necessary details for the booking. Let's start over.",
      newState: { currentStep: 'general_chat' }
    };
  }

  const viewingRequest: ViewingRequest = {
    propertyId: property.id.toString(),
    clientName: details.name,
    clientContact: details.contact,
    preferredDate: details.date,
    preferredTime: details.time,
    message: `Viewing request for ${property.title} in ${property.location}`
  };

  const response = `Excellent! Your viewing has been confirmed.\n\n**Booking Confirmed:**\n• **Property:** ${property.title}\n• **Date & Time:** ${details.date} at ${details.time}\n• **Contact:** ${details.contact}\n\nOur property specialist will contact you shortly to finalize the arrangements. Thank you for choosing our services!`;

  return {
    message: response,
    newState: { currentStep: 'general_chat' },
    shouldNotifyAgent: true,
    viewingRequest
  };
};

export const cancelViewingBooking = (): AIResponse => {
  const response = "No problem! Your viewing request has been cancelled. Feel free to ask me about other properties or schedule a different viewing whenever you're ready.";
  
  return {
    message: response,
    newState: { currentStep: 'general_chat' }
  };
};

export const updateConversationState = (newState: ConversationState) => {
  conversationState = newState;
};

// New handler functions for enhanced AI capabilities

const handleComplexQuery = async (message: string): Promise<AIResponse> => {
  try {
    // Gather comprehensive company and property data
    const [companyInfo, propertyStats, properties, agents] = await Promise.all([
      aiDatabaseService.getCompanyInfo(),
      aiDatabaseService.getPropertyStats(),
      aiDatabaseService.getAllProperties(),
      aiDatabaseService.getAllAgents()
    ]);

    // Format context for AI
    const companyContext = openRouterService.formatCompanyContext(companyInfo, propertyStats);
    const propertyData = openRouterService.formatPropertyData(properties.slice(0, 10)); // Top 10 properties

    // Use OpenRouter AI for intelligent response
    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      companyContext,
      propertyData,
      [] // Could add conversation history here
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error in complex query handler:', error);
    // Fallback to knowledge base
    const knowledgeResults = companyKnowledgeBase.searchKnowledge(message);
    if (knowledgeResults.length > 0) {
      return handleKnowledgeBaseResponse(knowledgeResults, message);
    }

    return {
      message: "I'm having trouble processing your request right now. Please contact our team at +254 700 123 456 for immediate assistance.",
      newState: conversationState
    };
  }
};

const handleGreeting = async (message: string): Promise<AIResponse> => {
  try {
    const companyInfo = aiDatabaseService.getCompanyInfo();
    const propertyStats = await aiDatabaseService.getPropertyStats();

    const context = `Company: ${companyInfo.name}
Available Properties: ${propertyStats.totalProperties}
Average Price: KES ${propertyStats.averagePrice.toLocaleString()}
Locations: ${Object.keys(propertyStats.locationCounts).join(', ')}`;

    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      context,
      'Greeting - provide a warm welcome and overview of services',
      []
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error in greeting handler:', error);
    const companyInfo = aiDatabaseService.getCompanyInfo();
    const response = `Hello! I'm your AI Property Assistant for ${companyInfo.name}. I can help you with:\n\n• **Property Search** - Find luxury properties by location, price, or features\n• **Company Information** - Learn about our services and expertise\n• **Market Insights** - Get current market data and trends\n• **Viewing Arrangements** - Schedule property viewings with our agents\n• **Investment Advice** - Understand property investment opportunities\n\nWhat would you like to know about our luxury property collection?`;

    return {
      message: response,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  }
};

const handleCompanyInquiry = async (message: string): Promise<AIResponse> => {
  try {
    // Gather real-time company data
    const [companyInfo, propertyStats, agents, tasks] = await Promise.all([
      aiDatabaseService.getCompanyInfo(),
      aiDatabaseService.getPropertyStats(),
      aiDatabaseService.getAllAgents(),
      aiDatabaseService.getTaskStats()
    ]);

    // Search knowledge base for relevant information
    const knowledgeResults = companyKnowledgeBase.searchKnowledge(message);

    // Prepare context for AI
    const companyContext = openRouterService.formatCompanyContext(companyInfo, propertyStats);
    const additionalContext = `
CURRENT TEAM: ${agents.length} active agents
CURRENT TASKS: ${tasks.totalTasks} total tasks (${tasks.pendingTasks} pending)
KNOWLEDGE BASE RESULTS: ${knowledgeResults.length > 0 ? knowledgeResults[0].content.answer || knowledgeResults[0].content.description : 'No specific matches'}
`;

    // Use OpenRouter AI for intelligent response
    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      companyContext + additionalContext,
      'Company inquiry - provide comprehensive information about Musili Homes',
      []
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error handling company inquiry:', error);
    // Fallback to knowledge base only if AI fails
    const knowledgeResults = companyKnowledgeBase.searchKnowledge(message);
    if (knowledgeResults.length > 0) {
      return handleKnowledgeBaseResponse(knowledgeResults, message);
    }

    return {
      message: "I'm having trouble accessing our company information right now. Please contact our team at +254 700 123 456 for immediate assistance.",
      newState: conversationState
    };
  }
};

const handlePropertyInquiry = async (message: string, entities: any): Promise<AIResponse & { visualType?: string; visualData?: any }> => {
  let properties: Property[] = [];
  try {
    // Get matching properties and market data
    const [matchedProperties, allProperties, propertyStats] = await Promise.all([
      findMatchingProperties(entities),
      aiDatabaseService.getAllProperties(),
      aiDatabaseService.getPropertyStats()
    ]);

    // Prepare property data for AI context
    const propertyData = openRouterService.formatPropertyData(
      matchedProperties.length > 0 ? matchedProperties : allProperties.slice(0, 10)
    );

    const marketContext = `
SEARCH CRITERIA: ${JSON.stringify(entities)}
MATCHED PROPERTIES: ${matchedProperties.length}
TOTAL AVAILABLE: ${propertyStats.totalProperties}
AVERAGE PRICE: KES ${propertyStats.averagePrice.toLocaleString()}
LOCATIONS: ${Object.keys(propertyStats.locationCounts).join(', ')}
`;

    // Use OpenRouter AI for intelligent property recommendations
    try {
      const aiResponse = await openRouterService.generateContextualResponse(
        message,
        marketContext,
        propertyData,
        []
      );

      return {
        message: aiResponse,
        newState: {
          ...conversationState,
          currentStep: 'property_inquiry',
          propertyContext: matchedProperties.length > 0 ? matchedProperties[0] : undefined
        },
        visualType: 'property_cards',
        visualData: matchedProperties.length > 0 ? matchedProperties : allProperties.slice(0, 5)
      };
    } catch (openRouterError) {
      console.error('OpenRouter failed, using fallback response:', openRouterError);

      // Fallback response with actual property data
      if (matchedProperties.length > 0) {
        const cheapestProperty = matchedProperties.reduce((min, prop) =>
          prop.price < min.price ? prop : min, matchedProperties[0]);

        const fallbackResponse = `Based on our current inventory, the most affordable property is "${cheapestProperty.title}" in ${cheapestProperty.location} for KES ${cheapestProperty.price.toLocaleString()}. ${cheapestProperty.description}\n\nWould you like more details about this property or see other options in your budget?`;

        return {
          message: fallbackResponse,
          newState: {
            ...conversationState,
            currentStep: 'property_inquiry',
            propertyContext: cheapestProperty
          }
        };
      } else {
        return {
          message: "I'm having trouble processing your request right now. Please contact our team at +254 700 123 456 for assistance with property inquiries.",
          newState: conversationState
        };
      }
    }
  } catch (error) {
    console.error('Error handling property inquiry:', error);
    return {
      message: "I'm having trouble accessing our property database right now. Please contact our agents at +254 700 123 456 for immediate assistance with property inquiries.",
      newState: conversationState
    };
  }
};

const handleMarketInquiry = async (message: string): Promise<AIResponse & { visualType?: string; visualData?: any }> => {
  try {
    const [propertyStats, agentStats, taskStats, analytics] = await Promise.all([
      aiDatabaseService.getPropertyStats(),
      aiDatabaseService.getAgentStats(),
      aiDatabaseService.getTaskStats(),
      aiDatabaseService.getPropertyAnalytics()
    ]);

    const marketInsights = companyKnowledgeBase.getMarketInsights();

    // Prepare comprehensive market data for AI
    const marketData = `
PROPERTY STATISTICS:
- Total Properties: ${propertyStats.totalProperties}
- Average Price: KES ${propertyStats.averagePrice.toLocaleString()}
- Price Range: KES ${propertyStats.priceRange.min.toLocaleString()} - ${propertyStats.priceRange.max.toLocaleString()}
- Total Portfolio Value: KES ${analytics.totalValue.toLocaleString()}

LOCATION DISTRIBUTION:
${Object.entries(propertyStats.locationCounts).map(([location, count]) => `- ${location}: ${count} properties`).join('\n')}

PROPERTY STATUS:
${Object.entries(propertyStats.statusCounts).map(([status, count]) => `- ${status}: ${count} properties`).join('\n')}

TEAM PERFORMANCE:
- Active Agents: ${agentStats.totalAgents}
- Agents with Properties: ${agentStats.agentsWithProperties}
- Average Properties per Agent: ${agentStats.averagePropertiesPerAgent.toFixed(1)}

MARKET INSIGHTS:
${marketInsights.map(insight => `- ${insight.area}: ${insight.trend} trend, ${insight.averagePrice}`).join('\n')}
`;

    // Use OpenRouter AI for intelligent market analysis
    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      'Market analysis request - provide comprehensive market insights and statistics',
      marketData,
      []
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' },
      visualType: 'stats',
      visualData: propertyStats
    };
  } catch (error) {
    console.error('Error handling market inquiry:', error);
    return {
      message: "I'm having trouble accessing market data right now. Please contact our team at +254 700 123 456 for the latest market insights and statistics.",
      newState: conversationState
    };
  }
};

const handleKnowledgeBaseResponse = (knowledgeResults: any[], message: string): AIResponse => {
  const topResult = knowledgeResults[0];
  let response = '';

  switch (topResult.type) {
    case 'faq':
      response = `**${topResult.content.question}**\n\n${topResult.content.answer}`;
      break;
    case 'service':
      response = `**${topResult.content.name}**\n\n${topResult.content.description}\n\n**Features:**\n`;
      topResult.content.features.forEach((feature: string) => {
        response += `• ${feature}\n`;
      });
      if (topResult.content.pricing) {
        response += `\n**Pricing:** ${topResult.content.pricing}`;
      }
      break;
    case 'policy':
      response = `**${topResult.content.title}**\n\n${topResult.content.description}\n\n**Details:**\n`;
      topResult.content.details.forEach((detail: string) => {
        response += `• ${detail}\n`;
      });
      break;
    case 'market':
      response = `**${topResult.content.area} Market Insight**\n\n`;
      response += `• Average Price: ${topResult.content.averagePrice}\n`;
      response += `• Market Trend: ${topResult.content.trend}\n\n`;
      response += `**Key Insights:**\n`;
      topResult.content.insights.forEach((insight: string) => {
        response += `• ${insight}\n`;
      });
      break;
    default:
      response = "I found some relevant information, but I'm having trouble formatting it. Please contact our team for detailed assistance.";
  }

  response += `\n\nIs there anything else you'd like to know?`;

  return {
    message: response,
    newState: { ...conversationState, currentStep: 'general_chat' }
  };
};

const handleAvailabilityInquiry = async (message: string): Promise<AIResponse> => {
  try {
    const availabilityReport = await aiDatabaseService.getAvailabilityReport();

    const availabilityData = `
CURRENT INVENTORY:
- Available for Sale: ${availabilityReport.availableForSale} properties
- Available for Rent: ${availabilityReport.availableForRent} properties
- Sold: ${availabilityReport.sold} properties
- Rented: ${availabilityReport.rented} properties
- Total Inventory: ${availabilityReport.totalInventory} properties

AVAILABILITY BY LOCATION:
${Object.entries(availabilityReport.availabilityByLocation).map(([location, data]) =>
  `- ${location}: ${data.forSale} for sale, ${data.forRent} for rent`
).join('\n')}
`;

    // Use OpenRouter AI for intelligent availability response
    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      'Property availability inquiry - provide current inventory information',
      availabilityData,
      []
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error handling availability inquiry:', error);
    return {
      message: "I'm having trouble accessing availability data. Please contact our team at +254 700 123 456 for current inventory information.",
      newState: conversationState
    };
  }
};

const handleAgentInquiry = async (message: string): Promise<AIResponse> => {
  try {
    const [agents, agentStats] = await Promise.all([
      aiDatabaseService.getAllAgents(),
      aiDatabaseService.getAgentStats()
    ]);

    let response = `**Our Professional Team**\n\n`;

    response += `**Team Overview:**\n`;
    response += `• Total Agents: ${agentStats.totalAgents}\n`;
    response += `• Active Agents with Properties: ${agentStats.agentsWithProperties}\n`;
    response += `• Average Properties per Agent: ${agentStats.averagePropertiesPerAgent.toFixed(1)}\n\n`;

    if (message.toLowerCase().includes('list') || message.toLowerCase().includes('who')) {
      response += `**Our Agents:**\n`;
      agents.slice(0, 5).forEach((agent: any) => {
        response += `• **${agent.name || 'Agent'}** - ${agent.email || 'Contact via office'}\n`;
        if (agent.bio) {
          response += `  ${agent.bio.substring(0, 100)}...\n`;
        }
      });
    }

    response += `\nWould you like to be connected with a specific agent or learn about their specialties?`;

    return {
      message: response,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error handling agent inquiry:', error);
    return {
      message: "I'm having trouble accessing agent information. Please contact our office to speak with one of our professional agents.",
      newState: conversationState
    };
  }
};

const handleTaskInquiry = async (message: string): Promise<AIResponse> => {
  try {
    const taskStats = await aiDatabaseService.getTaskStats();

    let response = `**Task Management Overview**\n\n`;

    response += `**Current Tasks:**\n`;
    response += `• Total Tasks: ${taskStats.totalTasks}\n`;
    response += `• Pending: ${taskStats.pendingTasks}\n`;
    response += `• In Progress: ${taskStats.inProgressTasks}\n`;
    response += `• Completed: ${taskStats.completedTasks}\n`;
    response += `• High Priority: ${taskStats.highPriorityTasks}\n\n`;

    if (message.toLowerCase().includes('pending') || message.toLowerCase().includes('urgent')) {
      const pendingTasks = await aiDatabaseService.getTasksByStatus('Pending');
      response += `**Pending Tasks:**\n`;
      pendingTasks.slice(0, 5).forEach((task: any) => {
        response += `• **${task.title}** (${task.priority} priority)\n`;
        if (task.due_date) {
          response += `  Due: ${new Date(task.due_date).toLocaleDateString()}\n`;
        }
      });
    }

    response += `\nWould you like details about specific tasks or agent assignments?`;

    return {
      message: response,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error handling task inquiry:', error);
    return {
      message: "I'm having trouble accessing task information. Please contact our team for current task status.",
      newState: conversationState
    };
  }
};

const handleAnalyticsInquiry = async (message: string): Promise<AIResponse> => {
  try {
    const analytics = await aiDatabaseService.getPropertyAnalytics();

    const analyticsData = `
PORTFOLIO OVERVIEW:
- Total Portfolio Value: KES ${analytics.totalValue.toLocaleString()}

AVERAGE PRICES BY LOCATION:
${Object.entries(analytics.averagePriceByLocation).map(([location, avgPrice]) =>
  `- ${location}: KES ${avgPrice.toLocaleString()}`
).join('\n')}

TOP PERFORMING AGENTS:
${analytics.topPerformingAgents.map((agent, index) =>
  `${index + 1}. ${agent.agentName}: ${agent.propertyCount} properties, KES ${agent.totalValue.toLocaleString()}`
).join('\n')}
`;

    // Use OpenRouter AI for intelligent analytics response
    const aiResponse = await openRouterService.generateContextualResponse(
      message,
      'Business analytics inquiry - provide comprehensive performance data and insights',
      analyticsData,
      []
    );

    return {
      message: aiResponse,
      newState: { ...conversationState, currentStep: 'general_chat' }
    };
  } catch (error) {
    console.error('Error handling analytics inquiry:', error);
    return {
      message: "I'm having trouble accessing analytics data. Please contact our team at +254 700 123 456 for detailed business reports.",
      newState: conversationState
    };
  }
};

// Create a propertyAI object to maintain compatibility with ChatInterface
export const propertyAI = {
  generateResponse: async (message: string, _conversationHistory: any[] = []): Promise<{ message: string; properties?: Property[]; visualType?: string; visualData?: any }> => {
    const response = await processUserMessage(message);
    updateConversationState(response.newState);
    // Property cards
    if (response.visualType === 'property_cards') {
      return {
        message: response.message,
        properties: response.visualData,
        visualType: 'property_cards',
        visualData: response.visualData
      };
    }
    // Stats
    if (response.visualType === 'stats') {
      return {
        message: response.message,
        visualType: 'stats',
        visualData: response.visualData
      };
    }
    // Default
    return { message: response.message };
  }
};
