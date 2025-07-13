import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Bug, CheckCircle, XCircle } from 'lucide-react';
import { processUserMessage } from '@/services/aiService';
import { nlpService } from '@/services/nlpService';

interface DebugResult {
  message: string;
  intent: any;
  entities: any;
  response: any;
  error?: string;
  timestamp: Date;
}

const AIDebugPanel: React.FC = () => {
  const [testMessage, setTestMessage] = useState('hello i need a house in karen');
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testAIResponse = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    const timestamp = new Date();
    
    try {
      console.log('🧪 Testing AI with message:', testMessage);
      
      // Step 1: Test intent analysis
      const intent = nlpService.analyzeIntent(testMessage);
      console.log('🎯 Intent analysis result:', intent);
      
      // Step 2: Test full AI response
      const response = await processUserMessage(testMessage);
      console.log('🤖 AI response:', response);
      
      const result: DebugResult = {
        message: testMessage,
        intent,
        entities: intent.entities,
        response,
        timestamp
      };
      
      setDebugResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
    } catch (error) {
      console.error('❌ AI test failed:', error);
      
      const result: DebugResult = {
        message: testMessage,
        intent: null,
        entities: null,
        response: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
      
      setDebugResults(prev => [result, ...prev.slice(0, 4)]);
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedTests = [
    'hello i need a house in karen',
    'show me properties in westlands',
    'i want a 3 bedroom house under 10 million',
    'what are your market insights?',
    'tell me about musilli homes',
    'i want to schedule a viewing',
    'hello',
    'good morning'
  ];

  const runPredefinedTest = (message: string) => {
    setTestMessage(message);
    setTimeout(() => testAIResponse(), 100);
  };

  const getIntentBadgeColor = (intent: string) => {
    const colors = {
      property_search: 'bg-green-100 text-green-700',
      property_info: 'bg-blue-100 text-blue-700',
      location_inquiry: 'bg-purple-100 text-purple-700',
      price_inquiry: 'bg-yellow-100 text-yellow-700',
      viewing_request: 'bg-orange-100 text-orange-700',
      greeting: 'bg-gray-100 text-gray-700',
      general_inquiry: 'bg-indigo-100 text-indigo-700'
    };
    return colors[intent as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-full">
          <Bug className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Assistant Debug Panel</h2>
          <p className="text-gray-600">Test and debug AI assistant responses</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Test AI Response</h3>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            onKeyPress={(e) => e.key === 'Enter' && testAIResponse()}
            className="flex-1"
          />
          <Button 
            onClick={testAIResponse} 
            disabled={isLoading || !testMessage.trim()}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Tests:</h4>
          <div className="flex flex-wrap gap-2">
            {predefinedTests.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => runPredefinedTest(test)}
                className="text-xs"
              >
                {test}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {debugResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Debug Results</h3>
          
          <div className="space-y-4">
            {debugResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.error ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className="font-medium">"{result.message}"</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {result.error ? (
                  <div className="text-red-600 text-sm">
                    Error: {result.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Intent Analysis */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Intent Analysis:</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getIntentBadgeColor(result.intent?.type)}>
                          {result.intent?.type || 'unknown'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Confidence: {((result.intent?.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Entities */}
                    {result.entities && Object.keys(result.entities).length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Extracted Entities:</h5>
                        <div className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(result.entities, null, 2)}
                        </div>
                      </div>
                    )}

                    {/* AI Response */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">AI Response:</h5>
                      <div className="text-sm text-gray-800 mt-1 p-2 bg-white rounded border">
                        {result.response?.message || 'No response'}
                      </div>
                      {result.response?.visualType && (
                        <div className="text-xs text-gray-500 mt-1">
                          Visual Type: {result.response.visualType} | 
                          Data Count: {result.response.visualData?.length || 0}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Expected Behavior</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>"hello i need a house in karen"</strong> should:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Detect intent: <Badge className="bg-green-100 text-green-700">property_search</Badge></li>
            <li>Extract location: "karen"</li>
            <li>Return property recommendations for Karen area</li>
            <li>Use OpenRouter AI for intelligent response</li>
            <li>Include visual property cards</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AIDebugPanel;
