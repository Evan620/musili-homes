import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Database, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { runAIAssistantTests, testDatabaseAccess, testProfessionalPrompting, testAIResponses } from '@/tests/aiAssistantTest';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

const AIAssistantTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Database Access', status: 'pending' },
    { name: 'Professional Prompting', status: 'pending' },
    { name: 'AI Responses', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message?: string, details?: any) => {
    setTestResults(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, details } : test
    ));
  };

  const runIndividualTest = async (testName: string) => {
    updateTestResult(testName, 'running');
    
    try {
      switch (testName) {
        case 'Database Access':
          await testDatabaseAccess();
          updateTestResult(testName, 'success', 'Database connection and data access working properly');
          break;
          
        case 'Professional Prompting':
          testProfessionalPrompting();
          updateTestResult(testName, 'success', 'Professional prompting system configured correctly');
          break;
          
        case 'AI Responses':
          await testAIResponses();
          updateTestResult(testName, 'success', 'AI response system functioning properly');
          break;
      }
    } catch (error) {
      updateTestResult(testName, 'error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const })));
    
    try {
      await runIndividualTest('Database Access');
      await runIndividualTest('Professional Prompting');
      await runIndividualTest('AI Responses');
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    const colors = {
      pending: 'bg-gray-100 text-gray-600',
      running: 'bg-yellow-100 text-yellow-700',
      success: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Assistant Test Panel</h2>
          <p className="text-gray-600">Test the enhanced AI assistant with professional prompting and database access</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Test Suite</h3>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        <div className="space-y-4">
          {testResults.map((test, index) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                  {getStatusBadge(test.status)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runIndividualTest(test.name)}
                  disabled={test.status === 'running'}
                >
                  Test
                </Button>
              </div>
              
              {test.message && (
                <p className={`text-sm mt-2 ${
                  test.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {test.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Assistant Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Enhanced Capabilities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Professional communication guidelines</li>
              <li>• Real-time database access</li>
              <li>• Comprehensive property data</li>
              <li>• Market insights and analytics</li>
              <li>• Intelligent property recommendations</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Professional Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Luxury real estate expertise</li>
              <li>• Client interaction best practices</li>
              <li>• Escalation protocols</li>
              <li>• Accurate data usage</li>
              <li>• Consistent brand representation</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Integration
        </h3>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>The AI assistant now has direct access to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All property listings with real-time updates</li>
            <li>Property images and detailed specifications</li>
            <li>Agent information and contact details</li>
            <li>Market statistics and trends</li>
            <li>Company information and services</li>
          </ul>
          <p className="mt-3 font-medium">
            This ensures all responses contain accurate, up-to-date information directly from the database.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantTestPanel;
