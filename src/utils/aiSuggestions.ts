import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM = `You are a product delivery lead. Given a plain-English NEED, return 2–4 milestones that a non-technical buyer can understand.

Milestone policy:
- Each milestone is a small, working outcome the buyer can SEE.
- Each milestone must include:
  • Title (short)
  • Outcome (plain words: what the buyer sees working)
  • Proof:
    - Always include a \`video_url\` (short demo video).
    - Describe what the video will show (e.g., "Video demo of admin starting and pausing a stream").
    - Always include a \`pull_request_url\` pointing to the related code changes (GitHub/GitLab).
    - Optionally, include a secondary link (e.g., tx_hash, live_link).
  • Timeline (days)
  • Payout (percent of total or a rough band)

Constraints:
- Only produce milestones directly related to the NEED.
- Do NOT output milestones like "Design," "Architecture document," "Prototype," "User testing," "Final implementation," or extras that don't reduce buyer risk.
- Stay focused on functional, proof-based outcomes of the NEED.
- Every milestone must contain \`video_url\` as proof.

Output format (JSON array):
[
  {
    "title": "...",
    "outcome": "...",
    "proof": {
      "video_url": "https://example.com/demo.mp4",
      "video_description": "Video demo of admin starting and pausing a stream",
      "pull_request_url": "https://github.com/org/repo/pull/123",
      "extra_link": "..." (optional)
    },
    "timeline": "X days",
    "payout": "Y%"
  }
]`;

const BANNED = [/design/i, /architecture/i, /prototype/i, /user testing/i, /final implementation/i];

function needsRepair(text: string) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const hasBanned = BANNED.some(rx => rx.test(text));
  const hasVideoUrl = /video_url/i.test(text);
  const hasPullRequestUrl = /pull_request_url/i.test(text);
  return hasBanned || !hasVideoUrl || !hasPullRequestUrl;
}

// Returns a plain text string you can drop in your UI
export async function generatePlainMilestones(need: string, context?: string) {
  if (!need || typeof need !== 'string') {
    throw new Error('Need must be a non-empty string');
  }
  
  const USER = `NEED:\n${need}\n\nCONTEXT (optional):\n${context || "unspecified"}`;
  const res1 = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: USER }
    ],
  });
  let out = res1.choices[0]?.message?.content?.trim() ?? "";

  if (needsRepair(out)) {
    const repair = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: USER },
        { role: "assistant", content: out },
        { role: "user", content: "Your milestones included items unrelated to the NEED or abstract planning steps. Rewrite them so they ONLY address the given NEED as functional, proof-based outcomes the buyer can see. Use 2–4 milestones in the same plain-text format." }
      ],
    });
    out = repair.choices[0]?.message?.content?.trim() ?? out;
  }

  return out;
}

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



