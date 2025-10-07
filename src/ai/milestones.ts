import OpenAI from "openai";
import { z } from "zod";

export type IntentType = "PRD" | "FEATURE" | "PROBLEM" | "IDEA";

export const MilestoneSchema = z.object({
  title: z.string().min(3),
  outcome: z.string().min(10),
  proof: z.object({
    video_description: z.string().min(5),
    pull_request_url: z.string().url().or(z.literal("N/A")).or(z.literal("GitHub PR link")).or(z.string().startsWith("https://github.com/")),
  }),
  timeline: z.string().min(2),
  payout: z.string().min(1)
});
export const MilestonesArraySchema = z.array(MilestoneSchema).min(3).max(10);
export type Milestone = z.infer<typeof MilestoneSchema>;

// Analytics logging type
type PlanLog = {
  ts: string;
  intent: IntentType;
  input_len: number;
  milestones_count: number;
  duration_ms: number;
  model: string;
};

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const MODEL = "gpt-4o-mini";

// Helper function to strip code fences
function stripCodeFences(t: string) {
  const m = t.match(/```json([\s\S]*?)```/i) || t.match(/```([\s\S]*?)```/i);
  return m ? m[1].trim() : t.trim();
}

// Safe parsing with gentle error handling
export function safeParseMilestones(jsonText: string) {
  try {
    const parsed = JSON.parse(stripCodeFences(jsonText));
    const value = MilestonesArraySchema.parse(parsed);
    return { ok: true as const, value };
  } catch (err: any) {
    const issues = err?.issues?.map((i: any) => `${i.path.join(".")}: ${i.message}`) ?? [String(err)];
    return { ok: false as const, error: "Validation failed", issues };
  }
}

// Versioned system prompts
const systemPromptV1 = `You convert inputs into fundable, verifiable milestones.
Always output ONLY a JSON array matching this TypeScript type:
type Milestone = {
  title: string;
  outcome: string;
  proof: { video_description: string; pull_request_url: string; };
  timeline: string;
  payout: string;
};
Rules:
- 3–8 milestones total.
- Titles are action-oriented.
- Outcome is user-verifiable and concrete.
- Proof includes a short demo video description and a PR URL placeholder (use "https://github.com/<org>/<repo>/pull/<n>" or "N/A" if not applicable).
- Timeline uses human-friendly ranges (e.g., "3–5 days").
- Payouts are strings (e.g., "900 USDC + 300 Team Points").`;

const systemPromptV2 = `You convert inputs into fundable, verifiable milestones for teams using Contribo — a platform
where many projects combine Web2 and Web3 components (smart contracts, wallets, DAOs, stablecoins, tokenized rewards).
Assume deliverables must be modular, fundable, and verifiable.

Always output ONLY a JSON array matching this TypeScript type:
type Milestone = {
  title: string;
  outcome: string;
  proof: { video_description: string; pull_request_url: string; };
  timeline: string;
  payout: string;
};
Rules:
- 3–8 milestones total.
- Titles are action-oriented.
- Outcome is user-verifiable and concrete.
- Proof includes a short demo video description and a PR URL placeholder (use "https://github.com/<org>/<repo>/pull/<n>" or "N/A").
- Timeline uses human-friendly ranges (e.g., "3–5 days").
- Payouts are strings (e.g., "900 USDC + 300 Team Points").`;

const systemPromptV3 = `You are a project breakdown expert helping founders structure work into clear, fundable milestones.

Your job: Convert any input (feature request, PRD, problem, idea) into 3-6 concrete milestones that a founder can post as paid work.

MILESTONE STRUCTURE:
{
  "title": "Clear, outcome-focused (what gets built, not how)",
  "outcome": "What the founder can see/test at the end",
  "proof": {
    "video_description": "What the contributor will demo",
    "pull_request_url": "GitHub PR link"
  },
  "timeline": "Realistic estimate in days",
  "payout": "X USDC + Y Team Points"
}

RULES:
1. Each milestone = one shippable piece of value
2. Titles should be understandable to non-technical founders
3. Preserve specific tools/services mentioned (Bridge.xyz, Persona, Safe, etc.)
4. Avoid generic SDLC steps unless they're genuinely separate work
5. Keep it to 3-6 milestones - combine related work
6. Outcomes must be demonstrable (the founder needs to verify it's done)

GOOD EXAMPLES:
✓ "Reward Distribution Smart Contract" (clear what's being built)
✓ "Bridge.xyz Fiat On-Ramp Integration" (specific service named)
✓ "KYC Flow with Persona" (clear outcome + tool)

BAD EXAMPLES:
✗ "Implement Backend Logic" (too vague)
✗ "Write Unit Tests" (not a milestone, part of implementation)
✗ "Deploy to Production" (not separate work)

Keep milestones focused on WHAT gets built, not HOW it's built.`;

const systemPromptV4 = `You are a project breakdown expert. Convert any input into 3-5 milestones that deliver working functionality.

CRITICAL: Each milestone must produce something DEMONSTRABLE - working code, live features, functional integrations. Avoid concept docs, feedback systems, or planning work unless explicitly requested.

MILESTONE PRIORITY ORDER:
1. Core technical implementation (contracts, integrations, APIs)
2. User-facing features (UI, flows, interactions)
3. Infrastructure/tooling (only if genuinely separate work)

STRUCTURE:
{
  "title": "What gets built (be specific about tech/service if mentioned)",
  "outcome": "What works and can be tested/demoed",
  "proof": {
    "video_description": "What the demo shows",
    "pull_request_url": "GitHub PR link"
  },
  "timeline": "3-10 days",
  "payout": "X USDC + Y Team Points"
}

RULES:
- If input mentions specific tech/services (Superfluid, Bridge.xyz, Persona), include them in milestone titles
- Combine related work - don't fragment into tiny pieces
- Skip generic steps like "testing", "documentation", "deployment" unless they're genuinely 3+ days of work
- Each milestone = something a founder can interact with and verify

GOOD: "Superfluid Streaming Payment Contract"
BAD: "Concept Framing for Streaming Payments"

GOOD: "DAO Dashboard with Real-Time Payment Streams"
BAD: "Community Feedback Layer"

If input is vague, make reasonable technical assumptions to deliver concrete milestones.`;

// Versioned intent guidance
const intentGuidanceV1: Record<IntentType, string> = {
  PRD: `Cover infra, integrations, core flows, compliance, link unfurling/deep links if present, and monitoring. Map non-functional reqs into tests.`,
  FEATURE: `Start with policy/spec, implement a vertical slice, add tests and docs, integrate with CI, finish with E2E and rollout.`,
  PROBLEM: `Start with taxonomy/measurements, add normalization/guardrails, solution spikes, safety & rollback, evaluation suite, canary with SLOs.`,
  IDEA: `Start with concept framing, build a minimal collaborative prototype, add contribution tracking, discovery/join flow, comms/review, reputation/rewards, community test.`
};

const intentGuidanceV2: Record<IntentType, string> = {
  PRD: `
  Break the PRD into 6–9 modules covering:
  - Core flows (onboarding, deposits, transfers, withdrawals)
  - Integrations (bridge.xyz, Persona, Safe, Crisp)
  - Dashboard/UI layer
  - Non-functional requirements (performance, security, scalability, compliance)
  - Monitoring and testing
  Explicitly name providers where relevant.
  `,
  FEATURE: `
  Start from policy/spec → implement a vertical slice → tests → docs → CI → rollout.
  If automation or rewards are involved, include smart contract integration and treasury safety checks (e.g., Safe, ERC-20).
  `,
  PROBLEM: `
  Begin with taxonomy and metrics → normalization/guardrails → intent router + confidence scoring →
  constrained LLM repair to a strict JSON/DSL → sandbox & rollback → evaluation suite with SLOs →
  telemetry/canary + incident replay → (optional) human-in-the-loop for high-risk ops.
  Target SLOs example: ≥95% success on brittle set, ≤3% fallback rate, p95 ≤300ms repair latency.
  `,
  IDEA: `
  Start from concept framing → collaborative prototype → contribution tracking →
  discovery/join flow → communication/review layer → reputation/rewards → community testing →
  (optional) early adopter traction and market validation.

  Encourage creativity and community design: this is an *idea*, not a spec.
  Include social, ecosystem, and feedback layers — not just technical deliverables.
  Keep it fundable and verifiable, but let milestones explore UX, incentives, and sustainability.
  Each milestone should feel like a step from vision to reality.
  `
};

// V4 Intent guidance - More implementation-focused
const intentGuidanceV4: Record<IntentType, string> = {
  PRD: `
  Focus on working implementations:
  - Core smart contracts and integrations (Superfluid, Safe, etc.)
  - Functional user interfaces and dashboards
  - Working API endpoints and data flows
  - Live monitoring and analytics
  Skip planning docs - build working systems.
  `,
  FEATURE: `
  Build working features in this order:
  1. Core implementation (smart contracts, APIs, integrations)
  2. User interface and interactions
  3. Testing and deployment automation
  Each milestone must produce demonstrable functionality.
  `,
  PROBLEM: `
  Create working solutions:
  1. Core problem-solving implementation
  2. User-facing tools and interfaces
  3. Monitoring and alerting systems
  Focus on working code, not analysis or planning.
  `,
  IDEA: `
  Build working prototypes:
  1. Core technical implementation (contracts, APIs, integrations)
  2. User-facing features and interfaces
  3. Community tools and dashboards
  Skip concept docs - build working systems that demonstrate the idea.
  `
};

// Version configuration - Change this to switch versions
const CURRENT_VERSION = "V4";

// Get current version components
function getCurrentVersion() {
  switch (CURRENT_VERSION) {
    case "V1":
      return { systemPrompt: systemPromptV1, intentGuidance: intentGuidanceV1 };
    case "V2":
      return { systemPrompt: systemPromptV2, intentGuidance: intentGuidanceV2 };
    case "V3":
      return { systemPrompt: systemPromptV3, intentGuidance: intentGuidanceV2 }; // V3 uses V2 intent guidance
    case "V4":
      return { systemPrompt: systemPromptV4, intentGuidance: intentGuidanceV4 };
    default:
      return { systemPrompt: systemPromptV2, intentGuidance: intentGuidanceV2 };
  }
}

// 1) Fast heuristic detector (cheap, deterministic)
export function heuristicDetectIntent(text: string): { guess: IntentType; confidence: number } {
  const t = text.toLowerCase();
  const hasHeadings = /(functional|non-?functional|user journeys|requirements|providers|kyc|security|performance|compliance)/i.test(text);
  const bulletCount = (text.match(/(^|\n)\s*[-*•]/g)?.length ?? 0);
  const hasBulletDensity = bulletCount >= 6;
  const hasSections = /(##|###|\n\n[A-Z][a-z]+:)/.test(text);
  const imperative = /(we need to|add |integrate |build |implement |enable )/i.test(text);
  const pain = /(is broken|is brittle|latency|drop|problem|issue|bug|fail|fails|too slow|too complex)/i.test(text);
  const broad = /(we would love to|we want to|vision|platform that|enable people to)/i.test(text);

  if ((hasHeadings && hasBulletDensity) || (hasHeadings && hasSections)) return { guess: "PRD", confidence: 0.85 };
  if (pain && !hasHeadings) return { guess: "PROBLEM", confidence: 0.7 };
  if (imperative && !hasHeadings) return { guess: "FEATURE", confidence: 0.6 };
  if (broad) return { guess: "IDEA", confidence: 0.6 };
  return { guess: "FEATURE", confidence: 0.4 };
}

// 2) LLM confirm when heuristic confidence is low
export async function llmConfirmIntent(text: string, heuristic: IntentType): Promise<IntentType> {
  console.log("🤖 LLM Intent Confirmation:", {
    input: text.substring(0, 100) + "...",
    heuristicSuggestion: heuristic
  });

  const sys = `You classify product inputs as exactly one of: PRD, FEATURE, PROBLEM, IDEA.
- PRD: structured doc with multiple sections (functional/non-functional, journeys, integrations).
- FEATURE: a concrete capability request, scoped.
- PROBLEM: describes a pain or failure, asks for a fix.
- IDEA: broad/aspirational vision, not implementation-ready.
Return ONLY the label.`;
  
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: `Heuristic suggestion: ${heuristic}\n\nInput:\n${text}` }
    ],
    temperature: 0
  });
  
  const rawResponse = res.choices[0]?.message?.content ?? "";
  const label = rawResponse.trim().toUpperCase();
  
  console.log("🤖 LLM Intent Response:", {
    rawResponse,
    processedLabel: label,
    isValid: label === "PRD" || label === "FEATURE" || label === "PROBLEM" || label === "IDEA"
  });
  
  if (label === "PRD" || label === "FEATURE" || label === "PROBLEM" || label === "IDEA") return label as IntentType;
  return heuristic; // fallback
}

// 3) Milestone generation
export async function generateMilestones(input: string, intent: IntentType): Promise<Milestone[]> {
  console.log("🎯 ===== GENERATING MILESTONES =====");
  console.log("Input:", input);
  console.log("Intent:", intent);
  console.log("Timestamp:", new Date().toISOString());

  const { systemPrompt, intentGuidance } = getCurrentVersion();
  
  console.log(`📝 Using ${CURRENT_VERSION} prompts`);

  const userPrompt = `Intent: ${intent}\nGuidance: ${intentGuidance[intent]}\n\nInput:\n${input}\n\nReturn ONLY the JSON array.`;

  console.log("📝 System Prompt:", systemPrompt);
  console.log("📝 User Prompt:", userPrompt);
  console.log("📝 Intent Guidance:", intentGuidance[intent]);

  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    // @ts-ignore optional if supported by your client
    seed: 7,               // for repeatability (if the SDK supports it)
    max_tokens: 1500       // give room for long PRDs + 7-9 milestones
  });

  const rawText = res.choices[0]?.message?.content ?? "[]";
  
  console.log("🤖 ===== LLM RAW RESPONSE =====");
  console.log("Raw text:", rawText);
  console.log("Length:", rawText.length);
  console.log("Has code fences:", rawText.includes("```"));

  // Use safe parsing with gentle error handling
  const parseResult = safeParseMilestones(rawText);
  
  if (parseResult.ok) {
    console.log("✅ Safe parsing successful!");
    console.log("✅ Parsed milestones:", parseResult.value);
    return parseResult.value;
  } else {
    console.error("❌ Safe parsing failed:", parseResult.error);
    console.error("❌ Validation issues:", parseResult.issues);
    console.log("🔄 Returning empty array as fallback");
    return [];
  }
}

// 4) Main entry with analytics logging
export async function planFromInput(raw: string): Promise<{ intent: IntentType; milestones: Milestone[] }> {
  const started = performance.now();
  const h = heuristicDetectIntent(raw);
  const intent = h.confidence >= 0.7 ? h.guess : await llmConfirmIntent(raw, h.guess);
  const milestones = await generateMilestones(raw, intent);
  
  const log: PlanLog = {
    ts: new Date().toISOString(),
    intent,
    input_len: raw.length,
    milestones_count: milestones.length,
    duration_ms: Math.round(performance.now() - started),
    model: MODEL
  };
  
  // send to your logger/analytics of choice
  console.info("[Contribo][plan]", log);
  
  return { intent, milestones };
}
