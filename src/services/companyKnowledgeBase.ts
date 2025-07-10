export interface CompanyPolicy {
  category: string;
  title: string;
  description: string;
  details: string[];
}

export interface ServiceOffering {
  name: string;
  description: string;
  features: string[];
  pricing?: string;
  duration?: string;
}

export interface MarketInsight {
  area: string;
  averagePrice: string;
  trend: 'rising' | 'stable' | 'declining';
  insights: string[];
  bestFor: string[];
}

export class CompanyKnowledgeBase {
  // Company Policies and Procedures
  getPolicies(): CompanyPolicy[] {
    return [
      {
        category: "Property Viewing",
        title: "Viewing Arrangements",
        description: "Our comprehensive property viewing policy ensures a premium experience for all clients.",
        details: [
          "All viewings are by appointment only",
          "Minimum 24-hour advance booking required",
          "Professional agent accompanies all viewings",
          "Flexible scheduling including weekends and evenings",
          "Virtual tours available for international clients",
          "Group viewings can be arranged for families",
          "Follow-up consultation included after viewing"
        ]
      },
      {
        category: "Pricing",
        title: "Transparent Pricing Policy",
        description: "We maintain transparent and competitive pricing across all our services.",
        details: [
          "No hidden fees or charges",
          "All prices quoted include applicable taxes",
          "Payment plans available for qualified buyers",
          "Professional valuation services included",
          "Market analysis provided with all listings",
          "Negotiation support included in our service",
          "Legal documentation assistance available"
        ]
      },
      {
        category: "Client Service",
        title: "Premium Client Experience",
        description: "Our commitment to exceptional client service sets us apart in the luxury market.",
        details: [
          "Dedicated agent assigned to each client",
          "24/7 customer support hotline",
          "Multilingual support available",
          "Concierge services for property management",
          "Regular market updates and newsletters",
          "Exclusive access to off-market properties",
          "Post-purchase support and assistance"
        ]
      },
      {
        category: "Investment",
        title: "Investment Advisory Services",
        description: "Expert guidance for property investment decisions in the Kenyan market.",
        details: [
          "Comprehensive market analysis provided",
          "ROI projections and investment modeling",
          "Portfolio diversification recommendations",
          "Tax optimization strategies",
          "Exit strategy planning",
          "Property management services available",
          "Regular performance reviews and updates"
        ]
      }
    ];
  }

  // Service Offerings
  getServices(): ServiceOffering[] {
    return [
      {
        name: "Luxury Property Sales",
        description: "Exclusive representation for high-end residential properties",
        features: [
          "Professional photography and virtual tours",
          "Targeted marketing to qualified buyers",
          "Negotiation and closing support",
          "Market analysis and pricing strategy",
          "Legal documentation assistance"
        ],
        pricing: "Commission-based (3-5% of sale price)",
        duration: "Typically 3-6 months"
      },
      {
        name: "Premium Rental Services",
        description: "Full-service rental management for luxury properties",
        features: [
          "Tenant screening and background checks",
          "Property marketing and showings",
          "Lease agreement preparation",
          "Monthly rent collection",
          "Property maintenance coordination"
        ],
        pricing: "10-15% of monthly rental income",
        duration: "Ongoing monthly service"
      },
      {
        name: "Investment Consulting",
        description: "Strategic advice for property investment portfolios",
        features: [
          "Market research and analysis",
          "Investment opportunity identification",
          "Risk assessment and mitigation",
          "Portfolio optimization strategies",
          "Performance tracking and reporting"
        ],
        pricing: "Consultation fees vary by scope",
        duration: "Project-based or ongoing retainer"
      },
      {
        name: "Property Management",
        description: "Comprehensive management services for property owners",
        features: [
          "Regular property inspections",
          "Maintenance and repair coordination",
          "Tenant relations management",
          "Financial reporting and accounting",
          "Emergency response services"
        ],
        pricing: "8-12% of rental income",
        duration: "Annual contracts with monthly billing"
      }
    ];
  }

  // Market Insights
  getMarketInsights(): MarketInsight[] {
    return [
      {
        area: "Westlands, Nairobi",
        averagePrice: "KES 80-150 million",
        trend: "rising",
        insights: [
          "Prime commercial and residential hub",
          "Excellent infrastructure and amenities",
          "High demand from expatriates and professionals",
          "Strong rental yields (6-8% annually)",
          "Proximity to business district drives value"
        ],
        bestFor: ["Investment properties", "Executive housing", "Commercial ventures"]
      },
      {
        area: "Karen, Nairobi",
        averagePrice: "KES 100-300 million",
        trend: "stable",
        insights: [
          "Prestigious residential area with large plots",
          "Excellent schools and healthcare facilities",
          "Strong expatriate community",
          "Consistent property value appreciation",
          "Low crime rates and gated communities"
        ],
        bestFor: ["Family homes", "Luxury estates", "Long-term investment"]
      },
      {
        area: "Naivasha Lakefront",
        averagePrice: "KES 150-400 million",
        trend: "rising",
        insights: [
          "Unique lakefront properties with scenic views",
          "Growing tourism and hospitality sector",
          "Limited supply drives premium pricing",
          "Popular for weekend homes and retreats",
          "Strong potential for vacation rental income"
        ],
        bestFor: ["Vacation homes", "Tourism investment", "Luxury retreats"]
      },
      {
        area: "Kilimani, Nairobi",
        averagePrice: "KES 60-120 million",
        trend: "rising",
        insights: [
          "Rapidly developing urban area",
          "High-rise apartments and modern developments",
          "Strong rental demand from young professionals",
          "Excellent public transport connectivity",
          "Growing commercial and entertainment options"
        ],
        bestFor: ["Rental investment", "Modern apartments", "Urban living"]
      }
    ];
  }

  // FAQ and Common Questions
  getFrequentlyAskedQuestions(): Array<{question: string; answer: string; category: string}> {
    return [
      {
        question: "What areas does Musili Homes specialize in?",
        answer: "We specialize in luxury properties across Kenya's prime locations including Nairobi (Westlands, Karen, Kilimani, Lavington), Naivasha lakefront estates, Mombasa coastal properties, and select developments in Nakuru and Kisumu.",
        category: "General"
      },
      {
        question: "How do I schedule a property viewing?",
        answer: "You can schedule a viewing by contacting our agents directly, using our online booking system, or speaking with our AI assistant. We require 24-hour advance notice and offer flexible scheduling including weekends.",
        category: "Viewing"
      },
      {
        question: "What is the typical price range for properties?",
        answer: "Our luxury properties typically range from KES 50 million to KES 500 million, depending on location, size, and features. We also have exclusive ultra-luxury properties above this range for discerning clients.",
        category: "Pricing"
      },
      {
        question: "Do you offer financing assistance?",
        answer: "Yes, we work with leading financial institutions to help clients secure competitive mortgage rates. We also offer guidance on payment plans and can connect you with our preferred banking partners.",
        category: "Financing"
      },
      {
        question: "What makes Musili Homes different from other real estate companies?",
        answer: "Our focus on luxury properties, personalized service, extensive market knowledge, and commitment to transparency sets us apart. We provide comprehensive support from initial consultation through post-purchase services.",
        category: "General"
      },
      {
        question: "Can international clients purchase properties?",
        answer: "Yes, we welcome international clients and provide specialized services including virtual tours, legal guidance for foreign ownership, currency exchange assistance, and property management services.",
        category: "International"
      },
      {
        question: "What ongoing support do you provide after purchase?",
        answer: "We offer comprehensive post-purchase support including property management services, maintenance coordination, rental management, market updates, and assistance with any property-related needs.",
        category: "Support"
      }
    ];
  }

  // Business Hours and Contact Information
  getBusinessInfo() {
    return {
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM", 
        sunday: "By appointment only",
        holidays: "Limited hours - call ahead"
      },
      emergencyContact: "+254 700 123 456",
      languages: ["English", "Swahili", "French", "German"],
      officeLocations: [
        {
          name: "Nairobi Head Office",
          address: "Musili Homes Tower, Westlands, Nairobi",
          phone: "+254 700 123 456",
          email: "nairobi@musilihomes.co.ke"
        },
        {
          name: "Mombasa Branch",
          address: "Nyali Bridge Plaza, Mombasa",
          phone: "+254 700 123 457",
          email: "mombasa@musilihomes.co.ke"
        }
      ]
    };
  }

  // Search knowledge base
  searchKnowledge(query: string): Array<{type: string; content: any; relevance: number}> {
    const results: Array<{type: string; content: any; relevance: number}> = [];
    const searchTerm = query.toLowerCase();

    // Search policies
    this.getPolicies().forEach(policy => {
      const relevance = this.calculateRelevance(searchTerm, [
        policy.title,
        policy.description,
        ...policy.details
      ]);
      if (relevance > 0) {
        results.push({ type: 'policy', content: policy, relevance });
      }
    });

    // Search services
    this.getServices().forEach(service => {
      const relevance = this.calculateRelevance(searchTerm, [
        service.name,
        service.description,
        ...service.features
      ]);
      if (relevance > 0) {
        results.push({ type: 'service', content: service, relevance });
      }
    });

    // Search market insights
    this.getMarketInsights().forEach(insight => {
      const relevance = this.calculateRelevance(searchTerm, [
        insight.area,
        ...insight.insights,
        ...insight.bestFor
      ]);
      if (relevance > 0) {
        results.push({ type: 'market', content: insight, relevance });
      }
    });

    // Search FAQs
    this.getFrequentlyAskedQuestions().forEach(faq => {
      const relevance = this.calculateRelevance(searchTerm, [faq.question, faq.answer]);
      if (relevance > 0) {
        results.push({ type: 'faq', content: faq, relevance });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(searchTerm: string, texts: string[]): number {
    let relevance = 0;
    const words = searchTerm.split(' ');
    
    texts.forEach(text => {
      const lowerText = text.toLowerCase();
      words.forEach(word => {
        if (lowerText.includes(word)) {
          relevance += 1;
        }
      });
    });
    
    return relevance;
  }
}

export const companyKnowledgeBase = new CompanyKnowledgeBase();
