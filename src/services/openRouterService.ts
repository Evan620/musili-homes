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

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = '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';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.model = 'google/gemini-2.5-flash-lite-preview-06-17'; // Correct DeepSeek model ID
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
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', response.status, errorData);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      const aiResponse = data.choices[0].message.content.trim();

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
    console.log('📊 OpenRouter: Company context:', companyContext);
    console.log('🏠 OpenRouter: Property data length:', propertyData.length);

    const systemPrompt = `You are an AI assistant for Musili Homes, Kenya's premier luxury real estate company. You have access to real-time company data and should provide helpful, accurate, and professional responses.

COMPANY CONTEXT:
${companyContext}

CURRENT PROPERTY DATA:
${propertyData}

INSTRUCTIONS:
- Always be professional, helpful, and knowledgeable about luxury real estate
- Use the provided company and property data to give accurate information
- If asked about properties, provide specific details from the data
- Help users with property searches, viewings, and general inquiries
- If you don't have specific information, direct users to contact the office
- Format responses clearly with bullet points, emojis, and sections when appropriate
- Keep responses concise and visual-friendly; avoid long paragraphs
- Suggest visual elements (like cards, stats, or charts) if possible, instead of just text
- Always maintain a luxury, premium tone befitting a high-end real estate company

Remember: You represent Musili Homes and should embody excellence in customer service.`;

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
      return 'No properties currently available.';
    }

    return properties.map(property => `
PROPERTY: ${property.title}
- Location: ${property.location}
- Price: KES ${property.price.toLocaleString()}
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Size: ${property.size?.toLocaleString()} sq ft
- Status: ${property.status}
- Description: ${property.description?.substring(0, 200)}...
`).join('\n');
  }

  // Test connection to OpenRouter API
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse([
        { role: 'user', content: 'Hello, please respond with "Connection successful"' }
      ], 'You are a test assistant. Respond exactly as requested.', 50);
      
      return response.toLowerCase().includes('connection successful');
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

export const openRouterService = new OpenRouterService();
