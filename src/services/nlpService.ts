
interface Intent {
  type: 'property_search' | 'property_info' | 'viewing_request' | 'general_inquiry' | 'greeting' | 'price_inquiry' | 'location_inquiry';
  confidence: number;
  entities: Record<string, any>;
}

interface Entity {
  type: 'location' | 'price_range' | 'bedrooms' | 'property_name' | 'date' | 'time' | 'contact_info';
  value: string;
  confidence: number;
}

export class NLPService {
  private locationKeywords = ['karen', 'westlands', 'naivasha', 'nairobi', 'location', 'area', 'where'];
  private priceKeywords = ['price', 'cost', 'budget', 'expensive', 'cheap', 'affordable', 'million', 'kes'];
  private propertyKeywords = ['house', 'home', 'property', 'villa', 'penthouse', 'estate', 'apartment'];
  private viewingKeywords = ['view', 'visit', 'see', 'schedule', 'book', 'appointment', 'viewing'];
  private greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];

  analyzeIntent(message: string, context: string = ''): Intent {
    const lowerMessage = message.toLowerCase();
    const fullText = (message + ' ' + context).toLowerCase();
    
    // Extract entities first
    const entities = this.extractEntities(fullText);
    
    // Determine intent based on keywords and entities
    if (this.containsKeywords(lowerMessage, this.greetingKeywords)) {
      return { type: 'greeting', confidence: 0.9, entities };
    }
    
    if (this.containsKeywords(lowerMessage, this.viewingKeywords) && 
        (this.containsKeywords(lowerMessage, this.propertyKeywords) || entities.property_name)) {
      return { type: 'viewing_request', confidence: 0.85, entities };
    }
    
    if (this.containsKeywords(lowerMessage, this.priceKeywords)) {
      return { type: 'price_inquiry', confidence: 0.8, entities };
    }
    
    if (this.containsKeywords(lowerMessage, this.locationKeywords)) {
      return { type: 'location_inquiry', confidence: 0.8, entities };
    }
    
    if (this.containsKeywords(lowerMessage, this.propertyKeywords) || entities.property_name) {
      return entities.property_name ? 
        { type: 'property_info', confidence: 0.9, entities } : 
        { type: 'property_search', confidence: 0.7, entities };
    }
    
    return { type: 'general_inquiry', confidence: 0.5, entities };
  }

  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract location
    const locationMatch = text.match(/(karen|westlands|naivasha|nairobi)/i);
    if (locationMatch) {
      entities.location = locationMatch[1];
    }
    
    // Extract property names (fuzzy matching)
    const propertyNames = ['luxurious lakefront villa', 'modern penthouse', 'elegant colonial estate'];
    for (const name of propertyNames) {
      if (this.fuzzyMatch(text, name, 0.6)) {
        entities.property_name = name;
        break;
      }
    }
    
    // Extract price range
    const priceMatch = text.match(/(\d+)\s*(million|m|k|thousand)/i);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1]);
      const unit = priceMatch[2].toLowerCase();
      entities.price_range = unit.includes('m') ? amount * 1000000 : amount * 1000;
    }
    
    // Extract bedroom count
    const bedroomMatch = text.match(/(\d+)[\s-]*(bed|bedroom)/i);
    if (bedroomMatch) {
      entities.bedrooms = parseInt(bedroomMatch[1]);
    }
    
    // Extract dates and times
    const dateTimeEntity = this.extractDateTime(text);
    if (dateTimeEntity.date) entities.date = dateTimeEntity.date;
    if (dateTimeEntity.time) entities.time = dateTimeEntity.time;
    
    // Extract contact info
    const contactInfo = this.extractContactInfo(text);
    Object.assign(entities, contactInfo);
    
    return entities;
  }

  private fuzzyMatch(text: string, target: string, threshold: number): boolean {
    const words = target.split(' ');
    const matchedWords = words.filter(word => 
      text.includes(word) || text.includes(word.substring(0, 4))
    );
    return (matchedWords.length / words.length) >= threshold;
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private extractDateTime(text: string): { date?: string; time?: string } {
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
      /(\d{1,2}\s*(?:AM|PM|am|pm))/i,
      /(morning|afternoon|evening|noon)/i
    ];
    
    const datePatterns = [
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(tomorrow|next\s+week|this\s+week|this\s+weekend|next\s+weekend)/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)/i
    ];
    
    let time, date;
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        time = match[1];
        break;
      }
    }
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }
    
    return { date, time };
  }

  private extractContactInfo(text: string): Record<string, string> {
    const contact: Record<string, string> = {};
    
    const namePattern = /(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i;
    const phonePattern = /(?:phone|number|call me at|reach me at)\s*(?:is\s*)?([+]?[\d\s\-()]{10,})/i;
    const emailPattern = /(?:email|mail)\s*(?:is\s*)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    
    const nameMatch = text.match(namePattern);
    if (nameMatch) contact.name = nameMatch[1].trim();
    
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) contact.phone = phoneMatch[1].trim();
    
    const emailMatch = text.match(emailPattern);
    if (emailMatch) contact.email = emailMatch[1].trim();
    
    return contact;
  }

  generateSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'good', 'excellent', 'perfect', 'amazing', 'love', 'interested', 'yes'];
    const negativeWords = ['bad', 'terrible', 'no', 'hate', 'expensive', 'small', 'not interested'];
    
    const words = text.toLowerCase().split(' ');
    const positiveScore = words.filter(word => positiveWords.includes(word)).length;
    const negativeScore = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
}

export const nlpService = new NLPService();

// Export individual functions for compatibility
export const detectIntent = (message: string) => {
  return nlpService.analyzeIntent(message);
};

export const extractEntities = (message: string) => {
  const intent = nlpService.analyzeIntent(message);
  return intent.entities;
};
