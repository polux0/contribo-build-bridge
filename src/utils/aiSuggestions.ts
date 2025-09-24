interface AISuggestion {
  title: string;
  description: string;
  price: string;
  timeline: string;
  deliverables: string[];
}

const suggestionTemplates = {
  auth: {
    keywords: ['auth', 'login', 'signin', 'signup', 'authentication', 'user', 'account', 'session', 'jwt', 'oauth', 'siwe', 'wallet'],
    suggestions: {
      title: "Authentication System",
      basePrice: [2000, 4000],
      timeline: "1–2 weeks",
      deliverables: [
        "User registration and login flow",
        "Session management and security",
        "Password reset functionality",
        "Tests and documentation"
      ]
    }
  },
  payment: {
    keywords: ['payment', 'stripe', 'checkout', 'billing', 'subscription', 'pay', 'purchase', 'wallet', 'crypto'],
    suggestions: {
      title: "Payment Integration",
      basePrice: [3000, 5000],
      timeline: "2–3 weeks", 
      deliverables: [
        "Payment gateway integration",
        "Checkout flow and UI",
        "Transaction handling",
        "Payment confirmation system"
      ]
    }
  },
  dashboard: {
    keywords: ['dashboard', 'admin', 'analytics', 'chart', 'graph', 'report', 'data', 'metrics'],
    suggestions: {
      title: "Dashboard & Analytics",
      basePrice: [2500, 4500],
      timeline: "2–3 weeks",
      deliverables: [
        "Interactive dashboard interface",
        "Data visualization components", 
        "Real-time updates",
        "Export and filtering features"
      ]
    }
  },
  api: {
    keywords: ['api', 'backend', 'database', 'crud', 'endpoint', 'rest', 'graphql', 'server'],
    suggestions: {
      title: "API Development",
      basePrice: [3500, 6000],
      timeline: "2–4 weeks",
      deliverables: [
        "RESTful API endpoints",
        "Database schema and models",
        "API documentation",
        "Testing and validation"
      ]
    }
  },
  ui: {
    keywords: ['ui', 'design', 'component', 'interface', 'frontend', 'responsive', 'mobile', 'layout'],
    suggestions: {
      title: "UI Component Library",
      basePrice: [2000, 3500],
      timeline: "1–2 weeks",
      deliverables: [
        "Reusable UI components",
        "Responsive design system",
        "Component documentation",
        "Accessibility compliance"
      ]
    }
  },
  stream: {
    keywords: ['stream', 'streaming', 'sablier', 'superfluid', 'payment', 'payments', 'crypto', 'defi', 'contributor', 'multisig', 'safe', 'dao', 'web3'],
    suggestions: {
      title: "Stream Payment System",
      basePrice: [5000, 8000],
      timeline: "3–4 weeks",
      deliverables: [
        "Stream provider integration (Sablier or Superfluid)",
        "Admin UI to start/pause/cancel streams (role-based; SAFE multisig-friendly)",
        "On-chain event sync (indexer/webhooks) to update contributor balances"
      ]
    }
  }
};

export function generateAISuggestion(description: string): AISuggestion {
  const lowerDesc = description.toLowerCase();
  
  // Find the best matching template
  let bestMatch = null;
  let maxMatches = 0;
  
  for (const [category, template] of Object.entries(suggestionTemplates)) {
    const matches = template.keywords.filter(keyword => 
      lowerDesc.includes(keyword)
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = { category, template };
    }
  }
  
  // If no good match, create a generic suggestion with stream-focused milestones
  if (!bestMatch || maxMatches === 0) {
    return {
      title: "Custom Development Task",
      description: "Implement the requested functionality with clean, maintainable code.",
      price: "$2,000–$4,000",
      timeline: "2–3 weeks",
      deliverables: [
        "Core functionality implementation",
        "Testing and quality assurance",
        "Documentation and deployment"
      ]
    };
  }
  
  const { template } = bestMatch;
  const [minPrice, maxPrice] = template.suggestions.basePrice;
  
  // Add some variation based on description length/complexity
  const complexityMultiplier = Math.min(1.5, Math.max(0.8, description.length / 100));
  const adjustedMin = Math.round(minPrice * complexityMultiplier);
  const adjustedMax = Math.round(maxPrice * complexityMultiplier);
  
  return {
    title: template.suggestions.title,
    description: `Implement ${description.toLowerCase().trim()}.`, // Clean description without extra text
    price: `$${adjustedMin.toLocaleString()}–$${adjustedMax.toLocaleString()}`,
    timeline: template.suggestions.timeline,
    deliverables: template.suggestions.deliverables
  };
}

export function refineAISuggestion(currentSuggestion: AISuggestion, action: string): AISuggestion {
  switch (action) {
    case "Refine with AI":
      return {
        ...currentSuggestion,
        description: currentSuggestion.description + " Enhanced with AI-powered optimizations.",
        deliverables: [
          ...currentSuggestion.deliverables,
          "AI-enhanced code quality"
        ]
      };
      
    case "Tighten scope":
      return {
        ...currentSuggestion,
        title: currentSuggestion.title + " (Core)",
        description: currentSuggestion.description.replace("includes testing and documentation", "focused core implementation"),
        price: currentSuggestion.price.replace(/\$[\d,]+/, (match) => {
          const num = parseInt(match.replace(/[$,]/g, ''));
          return `$${Math.round(num * 0.7).toLocaleString()}`;
        }),
        timeline: currentSuggestion.timeline.replace(/\d+/, (match) => {
          return String(Math.max(1, parseInt(match) - 1));
        }),
        deliverables: currentSuggestion.deliverables.slice(0, 2)
      };
      
    case "Suggest tests":
      return {
        ...currentSuggestion,
        deliverables: [
          ...currentSuggestion.deliverables.filter(d => !d.toLowerCase().includes('test')),
          "Comprehensive test suite",
          "Integration tests",
          "E2E testing scenarios"
        ]
      };
      
    default:
      return currentSuggestion;
  }
}



