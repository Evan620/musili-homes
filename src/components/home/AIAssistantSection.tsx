
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Minimize2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ChatInterface from './ChatInterface';

const AIAssistantSection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to exit fullscreen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFullscreen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const handleInputFocus = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
    }
  };

  const handleMinimize = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300" />
      )}

      <div
        ref={sectionRef}
        id="ai-assistant"
        className={`transition-all duration-500 ease-in-out ${
          isFullscreen
            ? 'fixed inset-4 z-50 bg-gradient-to-br from-soft-ivory via-pure-white to-soft-ivory rounded-3xl shadow-2xl overflow-hidden'
            : 'py-24 bg-gradient-to-br from-soft-ivory via-pure-white to-soft-ivory'
        }`}
      >
        <div className={`${isFullscreen ? 'h-full flex flex-col p-6' : 'container mx-auto px-6'}`}>
          {/* Header section */}
          <div className={`${isFullscreen ? 'flex-shrink-0 mb-6' : 'text-center mb-16'}`}>
            <div className={`${isFullscreen ? 'flex items-center justify-between' : 'text-center'}`}>
              <div className={isFullscreen ? '' : 'text-center'}>
                <h2 className={`${isFullscreen ? 'text-3xl' : 'text-5xl'} font-thin luxury-heading ${isFullscreen ? 'mb-2' : 'mb-6'} tracking-wide`}>
                  Property Concierge
                </h2>
                {!isFullscreen && <div className="w-24 h-px bg-gold-whisper mx-auto mb-8"></div>}
                <p className={`${isFullscreen ? 'text-lg' : 'text-xl'} luxury-text ${isFullscreen ? '' : 'max-w-2xl mx-auto'} leading-relaxed`}>
                  {isFullscreen ? 'Ask me anything about our luxury properties' : 'Intelligent guidance for your property journey'}
                </p>
              </div>

              {isFullscreen && (
                <button
                  onClick={handleMinimize}
                  className="flex-shrink-0 p-3 bg-satin-silver/20 hover:bg-satin-silver/30 rounded-full transition-colors duration-200"
                  title="Minimize (Esc)"
                >
                  <Minimize2 className="h-6 w-6 text-deep-charcoal" />
                </button>
              )}
            </div>
          </div>

          {/* Chat interface container */}
          <div className={`${isFullscreen ? 'flex-1 min-h-0' : 'max-w-6xl mx-auto'}`}>
            <Card
              ref={cardRef}
              className={`luxury-card shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-pure-white to-soft-ivory/30 ${
                isFullscreen
                  ? 'h-full flex flex-col rounded-3xl'
                  : 'rounded-2xl'
              }`}
            >
              {!isFullscreen && (
                <div className="flex items-center gap-6 p-6 border-b border-satin-silver/30 bg-gradient-to-r from-pure-white to-soft-ivory/50">
                  <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 p-4 rounded-full shadow-lg">
                    <Bot className="h-8 w-8 text-pure-white" />
                  </div>
                  <div>
                    <h3 className="font-light text-2xl luxury-heading tracking-wide">Property Concierge</h3>
                    <p className="luxury-text font-light text-lg">Ask me anything about our luxury properties</p>
                  </div>
                </div>
              )}

              <div className={isFullscreen ? 'flex-1 min-h-0' : 'h-[500px]'}>
                <ChatInterface onInputFocus={handleInputFocus} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistantSection;
