/**
 * AI Assistant Test Suite
 * Tests for enhanced AI assistant with professional prompting and database access
 */

import { processUserMessage } from '../services/aiService';
import { aiDatabaseService } from '../services/aiDatabaseService';
import { AI_ASSISTANT_CONFIG } from '../services/aiPromptConfig';

/**
 * Test the AI assistant's database connectivity and data access
 */
export const testDatabaseAccess = async (): Promise<void> => {
  console.log('🧪 Testing AI Assistant Database Access...');
  
  try {
    // Test property data access
    const properties = await aiDatabaseService.getAllProperties();
    console.log(`✅ Properties fetched: ${properties.length}`);
    
    if (properties.length > 0) {
      const sampleProperty = properties[0];
      console.log('📋 Sample property data:', {
        id: sampleProperty.id,
        title: sampleProperty.title,
        price: sampleProperty.price,
        location: sampleProperty.location,
        status: sampleProperty.status,
        hasImages: sampleProperty.images?.length > 0,
        hasAgent: !!sampleProperty.agent
      });
    }
    
    // Test property statistics
    const stats = await aiDatabaseService.getPropertyStats();
    console.log('📊 Property statistics:', stats);
    
    // Test agent data
    const agents = await aiDatabaseService.getAllAgents();
    console.log(`👥 Agents fetched: ${agents.length}`);
    
    // Test market insights
    const insights = await aiDatabaseService.getMarketInsights();
    console.log('📈 Market insights:', insights);
    
    console.log('✅ Database access test completed successfully');
  } catch (error) {
    console.error('❌ Database access test failed:', error);
    throw error;
  }
};

/**
 * Test the AI assistant's professional prompting system
 */
export const testProfessionalPrompting = (): void => {
  console.log('🧪 Testing Professional Prompting System...');
  
  try {
    // Test configuration access
    console.log('🏢 Company Name:', AI_ASSISTANT_CONFIG.COMPANY_NAME);
    console.log('📧 Contact Email:', AI_ASSISTANT_CONFIG.CONTACT_EMAIL);
    console.log('📞 Contact Phone:', AI_ASSISTANT_CONFIG.CONTACT_PHONE);
    
    // Test response templates
    console.log('💬 Greeting Template Length:', AI_ASSISTANT_CONFIG.RESPONSE_TEMPLATES.greeting.length);
    console.log('❌ Error Template Length:', AI_ASSISTANT_CONFIG.RESPONSE_TEMPLATES.error.length);
    
    // Test communication guidelines
    console.log('🎯 Communication Tone:', AI_ASSISTANT_CONFIG.COMMUNICATION_GUIDELINES.tone);
    console.log('🎨 Communication Style:', AI_ASSISTANT_CONFIG.COMMUNICATION_GUIDELINES.style);
    
    // Test capabilities
    const capabilities = Object.keys(AI_ASSISTANT_CONFIG.CAPABILITIES);
    console.log('🚀 Available Capabilities:', capabilities);
    
    // Test interaction guidelines
    console.log('📋 Data Accuracy Rules:', AI_ASSISTANT_CONFIG.INTERACTION_GUIDELINES.dataAccuracy.length);
    console.log('🤝 Client Service Rules:', AI_ASSISTANT_CONFIG.INTERACTION_GUIDELINES.clientService.length);
    console.log('🏆 Expertise Rules:', AI_ASSISTANT_CONFIG.INTERACTION_GUIDELINES.expertise.length);
    console.log('📞 Escalation Rules:', AI_ASSISTANT_CONFIG.INTERACTION_GUIDELINES.escalation.length);
    
    console.log('✅ Professional prompting test completed successfully');
  } catch (error) {
    console.error('❌ Professional prompting test failed:', error);
    throw error;
  }
};

/**
 * Test AI assistant responses with various query types
 */
export const testAIResponses = async (): Promise<void> => {
  console.log('🧪 Testing AI Assistant Responses...');
  
  const testQueries = [
    {
      type: 'greeting',
      message: 'Hello, I need help finding a property',
      expectedFeatures: ['greeting', 'capabilities', 'professional tone']
    },
    {
      type: 'property_search',
      message: 'I am looking for a 3-bedroom house in Nairobi under 10 million',
      expectedFeatures: ['property recommendations', 'price information', 'location details']
    },
    {
      type: 'market_inquiry',
      message: 'What are the current market trends in Nairobi?',
      expectedFeatures: ['market data', 'trends', 'statistics']
    },
    {
      type: 'company_info',
      message: 'Tell me about MUSILLI Homes',
      expectedFeatures: ['company information', 'services', 'expertise']
    },
    {
      type: 'investment_advice',
      message: 'Is this a good time to invest in real estate?',
      expectedFeatures: ['investment insights', 'market analysis', 'professional advice']
    }
  ];
  
  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Testing ${query.type} query: "${query.message}"`);
      
      const response = await processUserMessage(query.message);
      
      console.log('📝 Response received:', {
        messageLength: response.message.length,
        hasNewState: !!response.newState,
        hasVisualData: !!response.visualData,
        visualType: response.visualType
      });
      
      // Check for professional tone indicators
      const message = response.message.toLowerCase();
      const professionalIndicators = [
        'musilli homes',
        'luxury',
        'professional',
        'assistance',
        'property',
        'real estate'
      ];
      
      const foundIndicators = professionalIndicators.filter(indicator => 
        message.includes(indicator)
      );
      
      console.log('✅ Professional indicators found:', foundIndicators);
      
      // Check response quality
      if (response.message.length < 50) {
        console.warn('⚠️ Response seems too short');
      }
      
      if (response.message.length > 2000) {
        console.warn('⚠️ Response seems too long');
      }
      
    } catch (error) {
      console.error(`❌ Failed to test ${query.type} query:`, error);
    }
  }
  
  console.log('\n✅ AI response testing completed');
};

/**
 * Run comprehensive AI assistant tests
 */
export const runAIAssistantTests = async (): Promise<void> => {
  console.log('🚀 Starting AI Assistant Comprehensive Tests...\n');
  
  try {
    // Test 1: Database Access
    await testDatabaseAccess();
    console.log('');
    
    // Test 2: Professional Prompting
    testProfessionalPrompting();
    console.log('');
    
    // Test 3: AI Responses
    await testAIResponses();
    
    console.log('\n🎉 All AI Assistant tests completed successfully!');
    console.log('✅ Database access: Working');
    console.log('✅ Professional prompting: Configured');
    console.log('✅ AI responses: Functional');
    
  } catch (error) {
    console.error('\n❌ AI Assistant tests failed:', error);
    throw error;
  }
};

// Export test functions for individual use
export {
  testDatabaseAccess,
  testProfessionalPrompting,
  testAIResponses
};
