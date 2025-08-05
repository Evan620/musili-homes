interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

import { generateSystemPrompt, generateContextPrompt } from './aiPromptConfig';

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'anthropic/claude-3.5-sonnet'; // More reliable model for real estate conversations

    if (!this.apiKey) {
      console.error('🚨 OpenRouter API key not found in environment variables');
      console.error('🚨 Please set VITE_OPENROUTER_API_KEY in your environment');
    }
  }

  async generateResponse(
    messages: OpenRouterMessage[],
    systemPrompt?: string,
    maxTokens: number = 1000
  ): Promise<string> {
    try {
      console.log('🔄 OpenRouter: Making API call with model:', this.model);
      console.log('📝 OpenRouter: System prompt length:', systemPrompt?.length || 0);
      console.log('💬 OpenRouter: Messages count:', messages.length);

      const requestMessages: OpenRouterMessage[] = [];

      // Add system prompt if provided
      if (systemPrompt) {
        requestMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add conversation messages
      requestMessages.push(...messages);

      console.log('📡 OpenRouter: Making fetch request to:', `${this.baseUrl}/chat/completions`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Musili Homes AI Assistant'
        },
        body: JSON.stringify({
          model: this.model,
          messages: requestMessages,
          max_tokens: maxTokens,
          temperature: 0.3, // Lower temperature for more consistent responses
          top_p: 0.8,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🚨 OpenRouter API error:', response.status, response.statusText);
        console.error('🚨 OpenRouter error details:', errorData);
        throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      const aiResponse = data.choices[0].message.content.trim();

      console.log('✅ OpenRouter: Raw response received:', aiResponse.substring(0, 200) + '...');
      console.log('📊 OpenRouter: Response length:', aiResponse.length);

      if (data.usage) {
        console.log('📊 OpenRouter: Token usage:', data.usage);
      }

      // Validate response - check for garbled text (non-English characters that might indicate model issues)
      const hasValidEnglish = /[a-zA-Z]/.test(aiResponse);
      const hasExcessiveNonEnglish = aiResponse.length > 50 && (aiResponse.match(/[^\x00-\x7F]/g) || []).length > aiResponse.length * 0.5;

      if (!hasValidEnglish || hasExcessiveNonEnglish) {
        console.warn('🚨 OpenRouter: Detected potentially garbled response, falling back');
        throw new Error('Garbled response detected');
      }

      return aiResponse;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  async generateContextualResponse(
    userMessage: string,
    companyContext: string,
    propertyData: string,
    conversationHistory: OpenRouterMessage[] = []
  ): Promise<string> {
    console.log('🌐 OpenRouter: Generating contextual response for:', userMessage);
    console.log('📊 OpenRouter: Company context length:', companyContext.length);
    console.log('🏠 OpenRouter: Property data length:', propertyData.length);
    console.log('💬 OpenRouter: Conversation history length:', conversationHistory.length);

    // Use the centralized professional prompting system
    const systemPrompt = generateSystemPrompt(companyContext, propertyData);

    const messages: OpenRouterMessage[] = [
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await this.generateResponse(messages, systemPrompt, 1200);
    console.log('✅ OpenRouter: Generated response:', response);
    return response;
  }

  async generatePropertyAnalysis(
    propertyData: string,
    marketData: string,
    userQuery: string
  ): Promise<string> {
    const systemPrompt = `You are a luxury real estate market analyst for Musili Homes. Analyze the provided property and market data to give insightful, professional responses.

PROPERTY DATA:
${propertyData}

MARKET DATA:
${marketData}

Provide detailed analysis including:
- Property valuations and market positioning
- Investment potential and ROI projections
- Market trends and comparisons
- Recommendations based on client needs

Keep responses professional and data-driven.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: userQuery
      }
    ];

    return await this.generateResponse(messages, systemPrompt, 1500);
  }

  async generateViewingRecommendations(
    clientPreferences: string,
    availableProperties: string
  ): Promise<string> {
    const systemPrompt = `You are a luxury property consultant for Musili Homes. Based on client preferences and available properties, recommend the best matches and suggest viewing arrangements.

CLIENT PREFERENCES:
${clientPreferences}

AVAILABLE PROPERTIES:
${availableProperties}

Provide:
- Top 3-5 property recommendations with reasons
- Suggested viewing schedule
- Key selling points for each property
- Questions to ask during viewings

Be persuasive but honest, focusing on luxury and quality.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: 'Please provide property recommendations based on the client preferences and available inventory.'
      }
    ];

    return await this.generateResponse(messages, systemPrompt, 1000);
  }

  // Helper method to format company data for AI context
  formatCompanyContext(companyInfo: any, stats: any): string {
    return `
COMPANY: ${companyInfo.name}
DESCRIPTION: ${companyInfo.description}

SERVICES: ${companyInfo.services.join(', ')}
LOCATIONS: ${companyInfo.locations.join(', ')}
SPECIALTIES: ${companyInfo.specialties.join(', ')}

CONTACT:
- Phone: ${companyInfo.contactInfo.phone}
- Email: ${companyInfo.contactInfo.email}
- Address: ${companyInfo.contactInfo.address}

CURRENT STATISTICS:
- Total Properties: ${stats.totalProperties}
- Average Price: KES ${stats.averagePrice.toLocaleString()}
- Price Range: KES ${stats.priceRange.min.toLocaleString()} - ${stats.priceRange.max.toLocaleString()}
`;
  }

  // Helper method to format property data for AI context
  formatPropertyData(properties: any[]): string {
    if (!properties || properties.length === 0) {
      return 'No properties currently available in our database.';
    }

    // Limit to top 10 properties for better AI processing
    const limitedProperties = properties.slice(0, 10);

    return limitedProperties.map((property, index) => `
PROPERTY ${index + 1}: ${property.title}
- ID: ${property.id}
- Location: ${property.location}
- Address: ${property.address || 'Not specified'}
- Price: KES ${property.price?.toLocaleString() || 'Price on request'}
- Bedrooms: ${property.bedrooms || 'Not specified'}
- Bathrooms: ${property.bathrooms || 'Not specified'}
- Size: ${property.size ? `${property.size.toLocaleString()} sq ft` : 'Size not specified'}
- Status: ${property.status || 'Available'}
- Agent: ${property.agent?.name || 'Contact office'}
- Agent Contact: ${property.agent?.phone || property.agent?.email || 'Contact office'}
- Description: ${property.description ? property.description.substring(0, 150) + '...' : 'No description available'}
`).join('\n');
  }

  // Test connection to OpenRouter API
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 OpenRouter: Testing connection...');
      const response = await this.generateResponse([
        { role: 'user', content: 'Hello, please respond with "Connection successful"' }
      ], 'You are a test assistant. Respond exactly as requested.', 50);

      console.log('🔍 OpenRouter: Test response:', response);
      const isSuccessful = response.toLowerCase().includes('connection successful') || response.toLowerCase().includes('successful');
      console.log('🔍 OpenRouter: Connection test result:', isSuccessful);
      return isSuccessful;
    } catch (error) {
      console.error('🚨 OpenRouter: Connection test failed:', error);
      return false;
    }
  }

  // Quick test method for debugging
  async quickTest(): Promise<string> {
    try {
      return await this.generateResponse([
        { role: 'user', content: 'Say hello and tell me you are working properly.' }
      ], 'You are a helpful AI assistant for MUSILLI Homes real estate company.', 100);
    } catch (error) {
      console.error('🚨 OpenRouter: Quick test failed:', error);
      throw error;
    }
  }
}

export const openRouterService = new OpenRouterService();
