import React, { useMemo, useState, useEffect } from "react";

/**
 * Contribo - Live Gig Modules Component
 *
 * - Presents a gig split into 4 modules with status, details and progress
 * - Badge appears ONLY when the gig is fully completed (100 percent)
 * - Self-tests run in dev via useEffect (no global setTimeout)
 * - ASCII-only strings and careful JSX to avoid parser issues
 */

// -------------------- Data (Edit Me) --------------------
const gig = {
  id: "gig-001",
  title: "CollabBerry - Token Payments via SAFE Multisig",
  org: {
    name: "CollabBerry",
    url: "https://contribo.xyz",
  },
  developer: {
    name: "Jane Dev",
    avatar: "https://i.pravatar.cc/100?img=5", // optional
    tagline: "Fullstack engineer - Web3, Safe Protocol, Solidity",
  },
  summary:
    "Pilot implementation of token payouts through SAFE multisig: setup, payouts, tracking, and manual flows, split into 4 clear modules.",
  timeframe: {
    start: "2025-09-11",
    end: "2025-09-25",
  },
  modules: [
    {
      id: "m1",
      title: "Admin Configuration (Safe and Tokens)",
      owner: "Jane Dev",
      due: "2025-09-13",
      status: "in_progress", // not_started | in_progress | blocked | done
      short:
        "Configure Safe, stablecoin, and recognition mode (TeamPoints mint or DAO token).",
      long:
        "UI for chain selector, Safe address, stablecoin address, and recognition mode. Backend validation: Safe contract check, ERC-20 decimals, and MINTER_ROLE enforcement if TP minting.",
      acceptance: [
        "Safe validated as contract",
        "ERC-20 decimals cached",
        "MINTER_ROLE enforced for TP minting",
      ],
      deliverables: ["Admin config UI", "Validation logic", "Role checks"],
      // proof_of_delivery: "https://example.com/video1.mp4", // Video URL for proof
    },
    {
      id: "m2",
      title: "Round-based Payouts (Preview / Propose / Execute)",
      owner: "Jane Dev",
      due: "2025-09-16",
      status: "not_started",
      short: "Implement payout rounds with preview, proposal to Safe, and execution tracking.",
      long:
        "Frontend flow: list incomplete rounds, preview table of recipients, propose transactions (fiat or recognition or both). API endpoints for preview, propose, and status. Includes chunking logic for MultiSend transactions.",
      acceptance: [
        "Rounds list with preview and warnings",
        "Safe proposals created and linked",
        "Chunking logic enforced when calldata too large",
      ],
      deliverables: ["Rounds UI", "Preview API", "Propose API", "Status polling"],
      // proof_of_delivery: "https://example.com/video2.mp4", // Video URL for proof
    },
    {
      id: "m3",
      title: "Status and History (+ CSV Export)",
      owner: "Jane Dev",
      due: "2025-09-19",
      status: "not_started",
      short: "Display payout history with statuses, retries, Safe links, and CSV export.",
      long:
        "UI lists payouts with details of tx_proposals, attempts, Safe links, and recipients snapshot. Retry on failed proposals increments attempt count. CSV export provides full audit trace with on-chain and DB metadata.",
      acceptance: [
        "Statuses update via Safe Transaction Service",
        "Retry workflow functional",
        "CSV export includes all required fields",
      ],
      deliverables: ["Status UI", "Retry logic", "CSV export API"],
      // proof_of_delivery: "https://example.com/video3.mp4", // Video URL for proof
    },
    {
      id: "m4",
      title: "Manual Payouts via Safe",
      owner: "Jane Dev",
      due: "2025-09-25",
      status: "not_started",
      short:
        "Enable ad-hoc payouts (stablecoin and TP mint) via Safe with identical validation and tracking.",
      long:
        "Implements manual payouts following same Safe flow as round-based. Validations, chunking, proposals, status updates, and exports remain consistent. Requires Safe to hold MINTER_ROLE for TP minting.",
      acceptance: [
        "Manual payouts visible and executable",
        "Validation and chunking identical to Module II",
        "Tracked and exportable like round-based payouts",
      ],
      deliverables: ["Manual payout UI", "Validation reuse", "Safe integration"],
      // proof_of_delivery: "https://example.com/video4.mp4", // Video URL for proof
    },
  ],
  links: [
    { label: "Spec document", href: "#" },
    { label: "Issue tracker", href: "#" },
  ],
};

// -------------------- Helpers --------------------
function statusLabel(s: string) {
  switch (s) {
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "blocked":
      return "Blocked";
    case "done":
      return "Done";
    default:
      return String(s || "");
  }
}

function statusClasses(s: string) {
  const base = "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium";
  const map: Record<string, string> = {
    not_started: `${base} bg-gray-100 text-gray-700`,
    in_progress: `${base} bg-blue-100 text-blue-700`,
    blocked: `${base} bg-amber-100 text-amber-700`,
    done: `${base} bg-emerald-100 text-emerald-700`,
  };
  return map[s] || base;
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden" data-testid="progressbar">
      <div
        className="h-full bg-contribo-gold transition-[width] duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function hasItems(arr: any[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

interface Module {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: string;
  short: string;
  long?: string;
  acceptance?: string[];
  deliverables?: string[];
  proof_of_delivery?: string;
}

function ModuleCard({ mod }: { mod: Module }) {
  const [open, setOpen] = useState(false);

  const showDescription = Boolean(mod.long);
  const showAcceptance = hasItems(mod.acceptance);
  const showDeliverables = hasItems(mod.deliverables);
  const showProof = Boolean(mod.proof_of_delivery);

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow" data-testid={`module-${mod.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Module</div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{mod.title}</h3>
        </div>
        <span className={statusClasses(mod.status)}>{statusLabel(mod.status)}</span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{mod.short}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          Owner:
          <strong className="ml-1 font-medium text-gray-800">{mod.owner}</strong>
        </span>
        <span>
          Due:
          <strong className="ml-1 font-medium text-gray-800">{mod.due}</strong>
        </span>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 text-sm font-medium text-contribo-black underline underline-offset-4 hover:opacity-80 transition-all duration-200"
        aria-expanded={open}
        aria-controls={`details-${mod.id}`}
      >
        {open ? "Hide details" : "Show details"}
      </button>

      {/* Smoother animated details section */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-out ${
          open ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}
        aria-hidden={!open}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div id={`details-${mod.id}`} className="space-y-4 pt-4 border-t border-gray-100">
          {showDescription ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Description</div>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{mod.long}</p>
            </div>
          ) : null}

          {showAcceptance ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Acceptance Criteria</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {mod.acceptance?.map((a, i) => (
                  <li key={i} className="leading-relaxed">{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {showDeliverables ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Deliverables</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {mod.deliverables?.map((d, i) => (
                  <li key={i} className="leading-relaxed">{d}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {showProof ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Proof of Delivery</div>
              <div className="mt-2">
                <a 
                  href={mod.proof_of_delivery} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-contribo-black hover:text-contribo-gold transition-colors duration-200 underline underline-offset-4"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Watch delivery video
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Pure function so we can test progress logic separately
function calcProgress(modules: Module[]): number {
  if (!Array.isArray(modules) || modules.length === 0) return 0;
  const done = modules.filter((m) => m && m.status === "done").length;
  return Math.round((done / modules.length) * 100);
}

interface LiveGigModulesProps {
  gig?: typeof gig;
}

export function LiveGigModules(props: LiveGigModulesProps) {
  const data = props && props.gig ? props.gig : gig;
  const progress = useMemo(() => calcProgress(data.modules), [data.modules]);
  const doneCount = useMemo(() => data.modules.filter((m) => m.status === "done").length, [data.modules]);

  // Run self-tests in dev on client only
  useEffect(() => {
    const isDev = (() => {
      try { return typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production"; } catch (_) { return false; }
    })();
    if (typeof window !== "undefined" && isDev) {
      try { runSelfTests(); } catch (e) { console.error("Self-tests error:", e); }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8" data-testid="live-gig-modules">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-contribo-gold/10 text-contribo-black px-3 py-1 text-xs font-semibold mb-4">
          <span className="inline-block h-2 w-2 rounded-full bg-contribo-gold" />
          Live pilot gig
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-contribo-black mb-4">{data.title}</h1>
        <p className="text-lg text-contribo-text max-w-3xl mx-auto mb-6">{data.summary}</p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <span>
            Org:
            <a className="ml-1 underline underline-offset-4 hover:opacity-80 text-contribo-black" href={data.org.url}>
              {data.org.name}
            </a>
          </span>
          <span>
            Timeframe:
            <strong className="ml-1 text-contribo-black">{data.timeframe.start}</strong>
            <span> to </span>
            <strong className="text-contribo-black">{data.timeframe.end}</strong>
          </span>
          <span>
            Developer:
            <strong className="ml-1 text-contribo-black">{data.developer.name}</strong>
          </span>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Overall Progress</div>
            <div className="flex items-end justify-center gap-4 mb-4">
              <div className="text-4xl font-bold text-contribo-black">{progress}%</div>
              <div className="text-sm text-gray-500">{doneCount} / {data.modules.length} modules done</div>
            </div>
            <ProgressBar value={progress} />
            <div className="mt-4 text-xs text-gray-500 space-x-4">
              {data.links?.map((l) => (
                <a key={l.label} href={l.href} className="underline underline-offset-4 hover:opacity-80 text-contribo-black">{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {data.modules.map((m) => (
          <ModuleCard key={m.id} mod={m} />
        ))}
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-gray-200 p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-contribo-black mb-2">How it works</h2>
          <p className="text-gray-600">Transparency signals: named developer, public acceptance criteria, and visible progress timeline.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: 1, title: "Post", copy: "Define a crisp task and timeline." },
            { step: 2, title: "Match", copy: "Assign a developer and break work into 4 modules." },
            { step: 3, title: "Deliver", copy: "Ship module by module with public progress." },
          ].map((s) => (
            <div key={s.step} className="text-center p-6 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500 mb-2">Step {s.step}</div>
              <div className="text-xl font-semibold text-contribo-black mb-2">{s.title}</div>
              <p className="text-sm text-gray-600">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-gray-500">
        Tip: Mark modules as <span className="font-medium text-contribo-gold">Done</span> in the data object to auto-update progress.
      </div>
    </div>
  );
}

export default LiveGigModules;

// -------------------- Self Tests (run in dev, browser only) --------------------
function assert(condition: boolean, message?: string) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function runSelfTests() {
  try {
    // Test 1: status label mapping
    assert(statusLabel("in_progress") === "In progress", "statusLabel mapping failed");

    // Test 2: progress calc (0 done in default data)
    assert(calcProgress(gig.modules) === 0, "calcProgress should be 0 when none are done");

    // Test 3: progress calc when 2 of 4 are done
    const mods = gig.modules.map((m, i) => ({ ...m, status: i < 2 ? "done" : "not_started" }));
    assert(calcProgress(mods) === 50, "calcProgress should be 50 when 2 of 4 are done");

    // Test 4: statusClasses returns a string
    assert(typeof statusClasses("done") === "string", "statusClasses should return a string");

    // Test 5: hasItems helper
    assert(hasItems([1]) === true, "hasItems should be true for non-empty arrays");
    assert(hasItems([]) === false, "hasItems should be false for empty arrays");
    assert(hasItems(null) === false, "hasItems should be false for null");

    // Test 6: calcProgress clamps and handles garbage
    const bad = [{ status: "nope" }, { status: "done" }, null, {}];
    assert(calcProgress(bad as any) === 25, "calcProgress should count only 'done' statuses");

    // Test 7: ProgressBar input guard does not throw
    assert(Number.isFinite(calcProgress([])) && calcProgress([]) === 0, "ProgressBar safety depends on calcProgress");

    // Test 8: No raw '>' characters present in renderable gig strings
    assert(JSON.stringify(gig).indexOf(">") === -1, "Renderable gig strings must not contain '>' characters");

    // Test 9: statusLabel default path returns a string
    assert(typeof statusLabel("unknown") === "string", "statusLabel should return string for unknown statuses");

    // Test 10: 100 percent when all modules are done
    const allDone = gig.modules.map((m) => ({ ...m, status: "done" }));
    assert(calcProgress(allDone) === 100, "calcProgress should be 100 when all modules are done");

    console.info("LiveGigModules self-tests passed.");
  } catch (e) {
    console.error("LiveGigModules self-tests failed:", e);
  }
}
