
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Bell } from 'lucide-react';
import { propertyAI, testOpenRouterConnection } from '@/services/aiService';
import { Property } from '@/types';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { PropertyDescription } from '@/components/ui/formatted-text';
import '@/styles/chat-doodles.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isNotification?: boolean;
  properties?: Property[]; // legacy, will be replaced by visualData
  visualType?: 'property_cards' | 'stats' | 'agent_cards' | 'info_card' | 'tip' | string;
  visualData?: any;
}

interface ChatInterfaceProps {
  onNewMessage?: (message: ChatMessage) => void;
  onInputFocus?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNewMessage, onInputFocus }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      visualType: 'info_card',
      visualData: (
        <div>
          <div className="text-6xl mb-2">🤖</div>
          <div className="text-2xl font-bold text-gold-whisper mb-1">Welcome to Musili Homes!</div>
          <div className="text-base text-deep-charcoal mb-2">Your friendly AI Property Concierge</div>
          <div className="text-sm text-satin-silver">Ask me anything about our luxury homes, viewings, or agents. Let’s find your dream home together! 🏡✨</div>
        </div>
      )
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const scrollToBottom = () => {
    // Only scroll within the chat container, not the entire page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only auto-scroll if there's more than the initial message
    // This prevents auto-scrolling on page load
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  // Test OpenRouter connection on component mount
  useEffect(() => {
    const runTest = async () => {
      console.log('🧪 ChatInterface: Testing OpenRouter connection on mount...');
      await testOpenRouterConnection();
    };
    runTest();
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    console.log('🚀 ChatInterface: Sending message:', inputMessage);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🤖 ChatInterface: Calling propertyAI.generateResponse...');
      // Get AI response (now returns { message, properties })
      const aiResult = await propertyAI.generateResponse(inputMessage, messages);
      console.log('✅ ChatInterface: Got AI response:', aiResult.message);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResult.message,
        timestamp: new Date(),
        isNotification: aiResult.message && (aiResult.message.includes('notified') || aiResult.message.includes('Next Steps')),
        properties: aiResult.properties, // legacy, will be replaced
        visualType: aiResult.visualType,
        visualData: aiResult.visualData
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (onNewMessage) {
        onNewMessage(assistantMessage);
      }
    } catch (error) {
      console.error('🚨 ChatInterface: Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try asking about our properties, pricing, locations, or scheduling viewings, and I'll do my best to help!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const formatMessage = (content: string) => {
    // Convert simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={index} className="font-bold mb-1 text-gold-whisper">{line.slice(2, -2)}</div>;
        }
        if (line.startsWith('• ')) {
          return <div key={index} className="ml-4 mb-1">{line}</div>;
        }
        if (line.includes('**') && !line.startsWith('**')) {
          // Handle inline bold text
          const parts = line.split('**');
          return (
            <div key={index} className="mb-1">
              {parts.map((part, partIndex) => 
                partIndex % 2 === 1 ? 
                  <span key={partIndex} className="font-bold text-gold-whisper">{part}</span> : 
                  part
              )}
            </div>
          );
        }
        return line && <div key={index} className="mb-1">{line}</div>;
      });
  };

  // Helper to extract property stats from AI response
  const extractPropertyStats = (content: string) => {
    const stats: { total?: string; avg?: string; range?: string } = {};
    const totalMatch = content.match(/Total Properties:\s*([\d,]+)/i);
    const avgMatch = content.match(/Average Price:\s*([\w\s,]+)/i);
    const rangeMatch = content.match(/Price Range:\s*([\w\s,-]+)/i);
    if (totalMatch) stats.total = totalMatch[1];
    if (avgMatch) stats.avg = avgMatch[1];
    if (rangeMatch) stats.range = rangeMatch[1];
    return stats.total || stats.avg || stats.range ? stats : null;
  };

  // Helper for property card emojis
  const propertyEmojis = ['🏡', '🌴', '🏙️', '🌅', '🏖️', '🌇', '🏰', '🌲', '🏢', '🌊'];
  const getRandomEmoji = () => propertyEmojis[Math.floor(Math.random() * propertyEmojis.length)];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages with Doodle Background */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 chat-scrollbar chat-doodle-whatsapp">
        <div className="chat-content">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            {message.role === 'assistant' && (
              <div className={`p-3 rounded-full flex-shrink-0 shadow-lg ${
                message.isNotification ? 'bg-gradient-to-br from-gold-whisper to-gold-whisper/80' : 'bg-gradient-to-br from-gold-whisper to-gold-whisper/80'
              }`}>
                {message.isNotification ? (
                  <Bell className="h-5 w-5 text-pure-white" />
                ) : (
                  <Bot className="h-5 w-5 text-pure-white" />
                )}
              </div>
            )}

            <div
              className={`max-w-[75%] p-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                message.role === 'user'
                  ? 'message-bubble-user text-pure-white rounded-br-md'
                  : message.isNotification
                  ? 'message-bubble text-deep-charcoal border border-gold-whisper/20 rounded-bl-md'
                  : 'message-bubble text-deep-charcoal border border-satin-silver/30 rounded-bl-md'
              }`}
            >
              {/* Visual layouts based on visualType */}
              {message.role === 'assistant' && message.visualType === 'property_cards' && message.visualData && (
                <>
                  <div className="mb-2 text-gold-whisper font-semibold text-base">{message.content}</div>
                  {message.visualData.length > 1 ? (
                    <Carousel className="mb-4">
                      <CarouselContent>
                        {message.visualData.map((property: Property, idx: number) => (
                          <CarouselItem key={property.id} className="flex justify-center">
                            <div
                              className="bg-white/95 backdrop-blur-sm border border-gold-whisper/30 rounded-2xl shadow-lg overflow-hidden flex flex-col w-full max-w-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <div className="relative h-56 w-full bg-gray-100 flex items-center justify-center">
                                {property.images && property.images.length > 0 ? (
                                  <img src={property.images[0].image_url} alt={property.title} className="object-cover w-full h-full" />
                                ) : (
                                  <span className="text-6xl">{getRandomEmoji()}</span>
                                )}
                                <span className="absolute top-2 right-2 text-3xl">{getRandomEmoji()}</span>
                              </div>
                              <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl font-bold text-gold-whisper">{property.title}</span>
                                    {property.featured && <span className="ml-2 text-xs bg-gold-whisper/20 text-gold-whisper px-2 py-0.5 rounded-full">Featured</span>}
                                  </div>
                                  <div className="text-xs text-satin-silver mb-2">{property.location}</div>
                                  <div className="text-lg font-semibold text-deep-charcoal mb-1">KES {property.price.toLocaleString()}</div>
                                  <div className="flex gap-2 text-xs text-satin-silver mb-2">
                                    <span>🛏️ {property.bedrooms} bd</span>
                                    <span>🛁 {property.bathrooms} ba</span>
                                    <span>📐 {property.size?.toLocaleString() || '-'} sqft</span>
                                  </div>
                                  <PropertyDescription
                                    description={property.description}
                                    className="text-xs text-deep-charcoal/80 mb-2"
                                    maxLines={2}
                                    size="sm"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                  <button
                                    className="px-4 py-2 bg-gold-whisper/90 text-pure-white rounded-lg text-sm font-semibold shadow hover:bg-gold-whisper transition"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setToast('🎉 Viewing request started!');
                                    }}
                                  >
                                    Book Viewing
                                  </button>
                                  <button
                                    className="px-4 py-2 bg-satin-silver/80 text-deep-charcoal rounded-lg text-sm font-semibold shadow hover:bg-satin-silver transition"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/property/${property.id}`);
                                    }}
                                  >
                                    See More
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    <div className="mb-4 flex justify-center">
                      <div
                        className="bg-white/95 backdrop-blur-sm border border-gold-whisper/30 rounded-2xl shadow-lg overflow-hidden flex flex-col w-full max-w-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        onClick={() => navigate(`/property/${message.visualData[0].id}`)}
                      >
                        <div className="relative h-56 w-full bg-gray-100 flex items-center justify-center">
                          {message.visualData[0].images && message.visualData[0].images.length > 0 ? (
                            <img src={message.visualData[0].images[0].image_url} alt={message.visualData[0].title} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-6xl">{getRandomEmoji()}</span>
                          )}
                          <span className="absolute top-2 right-2 text-3xl">{getRandomEmoji()}</span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-gold-whisper">{message.visualData[0].title}</span>
                              {message.visualData[0].featured && <span className="ml-2 text-xs bg-gold-whisper/20 text-gold-whisper px-2 py-0.5 rounded-full">Featured</span>}
                            </div>
                            <div className="text-xs text-satin-silver mb-2">{message.visualData[0].location}</div>
                            <div className="text-lg font-semibold text-deep-charcoal mb-1">KES {message.visualData[0].price.toLocaleString()}</div>
                            <div className="flex gap-2 text-xs text-satin-silver mb-2">
                              <span>🛏️ {message.visualData[0].bedrooms} bd</span>
                              <span>🛁 {message.visualData[0].bathrooms} ba</span>
                              <span>📐 {message.visualData[0].size?.toLocaleString() || '-'} sqft</span>
                            </div>
                            <div className="text-xs text-deep-charcoal/80 mb-2 line-clamp-2">{message.visualData[0].description}</div>
                          </div>
                          <div className="flex gap-2 justify-end mt-4">
                            <button
                              className="px-4 py-2 bg-gold-whisper/90 text-pure-white rounded-lg text-sm font-semibold shadow hover:bg-gold-whisper transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                setToast('🎉 Viewing request started!');
                              }}
                            >
                              Book Viewing
                            </button>
                            <button
                              className="px-4 py-2 bg-satin-silver/80 text-deep-charcoal rounded-lg text-sm font-semibold shadow hover:bg-satin-silver transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/property/${message.visualData[0].id}`);
                              }}
                            >
                              See More
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {message.role === 'assistant' && message.visualType === 'stats' && message.visualData && (
                <>
                  <div className="mb-2 text-gold-whisper font-semibold text-base">{message.content}</div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-gold-whisper/10 border border-gold-whisper/30 rounded-xl px-4 py-2 text-center min-w-[110px]">
                      <div className="text-xs text-gold-whisper font-semibold">🏠 Properties</div>
                      <div className="text-lg font-bold text-gold-whisper">{message.visualData.totalProperties}</div>
                    </div>
                    <div className="bg-gold-whisper/10 border border-gold-whisper/30 rounded-xl px-4 py-2 text-center min-w-[110px]">
                      <div className="text-xs text-gold-whisper font-semibold">💰 Avg Price</div>
                      <div className="text-lg font-bold text-gold-whisper">KES {message.visualData.averagePrice?.toLocaleString()}</div>
                    </div>
                    <div className="bg-gold-whisper/10 border border-gold-whisper/30 rounded-xl px-4 py-2 text-center min-w-[110px]">
                      <div className="text-xs text-gold-whisper font-semibold">📊 Price Range</div>
                      <div className="text-lg font-bold text-gold-whisper">KES {message.visualData.priceRange?.min?.toLocaleString()} - {message.visualData.priceRange?.max?.toLocaleString()}</div>
                    </div>
                  </div>
                </>
              )}
              {message.role === 'assistant' && message.visualType === 'agent_cards' && message.visualData && (
                <>
                  <div className="mb-2 text-gold-whisper font-semibold text-base">{message.content}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {message.visualData.map((agent: any, idx: number) => (
                      <div key={agent.id} className="bg-white/95 backdrop-blur-sm border border-gold-whisper/30 rounded-2xl shadow-lg overflow-hidden flex flex-col items-center p-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                          {agent.photo ? (
                            <img src={agent.photo} alt={agent.name} className="object-cover w-full h-full rounded-full" />
                          ) : (
                            <span className="text-4xl">😎</span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-gold-whisper mb-1">{agent.name}</div>
                        <div className="text-xs text-satin-silver mb-1">{agent.email}</div>
                        <div className="text-xs text-deep-charcoal/80 italic mb-2">“{agent.bio?.substring(0, 40) || 'Luxury Expert'}”</div>
                        <div className="text-xs text-gold-whisper">⭐️ Top Agent</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {message.role === 'assistant' && message.visualType === 'info_card' && message.visualData && (
                <div className="mb-4 flex items-center justify-center">
                  <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-lg shadow w-full max-w-md flex items-center gap-3">
                    {typeof message.visualData === 'string' ? (
                      <>
                        <span className="text-2xl">ℹ️</span>
                        <div className="text-sm text-deep-charcoal font-medium">{message.visualData}</div>
                      </>
                    ) : (
                      message.visualData
                    )}
                  </div>
                </div>
              )}
              {message.role === 'assistant' && message.visualType === 'tip' && message.visualData && (
                <div className="mb-4 flex items-center justify-center">
                  <div className="bg-blue-100 border-l-4 border-blue-400 p-4 rounded-lg shadow w-full max-w-md flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="text-sm text-deep-charcoal font-medium">{message.visualData}</div>
                  </div>
                </div>
              )}
              <div className="text-sm leading-relaxed font-light">
                {formatMessage(message.content)}
              </div>
              <div className="text-xs opacity-60 mt-2 font-light">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 p-3 rounded-full flex-shrink-0 shadow-lg">
                <User className="h-5 w-5 text-pure-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 p-3 rounded-full shadow-lg">
              <Bot className="h-5 w-5 text-pure-white" />
            </div>
            <div className="message-bubble text-deep-charcoal p-4 rounded-2xl rounded-bl-md shadow-md border border-satin-silver/30">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gold-whisper/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gold-whisper/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gold-whisper/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gold-whisper text-pure-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold flex items-center gap-2 animate-in fade-in duration-300">
              {toast}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 border-t border-satin-silver/30 bg-gradient-to-r from-pure-white to-soft-ivory/50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onFocus={onInputFocus}
              placeholder="Ask about properties, schedule viewings, get pricing info..."
              className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-4 py-3 text-sm font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200 shadow-sm"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="luxury-button-primary px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
