
import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ChatInterface from './ChatInterface';

const AIAssistantSection: React.FC = () => {
  return (
    <div id="ai-assistant" className="py-24 bg-gradient-to-br from-soft-ivory via-pure-white to-soft-ivory">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-thin luxury-heading mb-6 tracking-wide">Personal Assistant</h2>
          <div className="w-24 h-px bg-gold-whisper mx-auto mb-8"></div>
          <p className="text-xl luxury-text max-w-2xl mx-auto leading-relaxed">
            Intelligent guidance for your property journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="luxury-card shadow-2xl rounded-2xl border-0 overflow-hidden bg-gradient-to-br from-pure-white to-soft-ivory/30">
            <div className="flex items-center gap-6 p-6 border-b border-satin-silver/30 bg-gradient-to-r from-pure-white to-soft-ivory/50">
              <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 p-4 rounded-full shadow-lg">
                <Bot className="h-8 w-8 text-pure-white" />
              </div>
              <div>
                <h3 className="font-light text-2xl luxury-heading tracking-wide">Property Concierge</h3>
                <p className="luxury-text font-light text-lg">Ask me anything about our luxury properties</p>
              </div>
            </div>

            <div className="h-[500px]">
              <ChatInterface />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSection;
