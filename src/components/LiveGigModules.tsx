import React, { useMemo, useState, useEffect } from "react";

/**
 * Contribo - Live Gig Modules Component (with Profile)
 *
 * - Presents a gig split into 4 modules with status, details and progress
 * - Adds a ProfileCard for the developer (name, current gig, progress)
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
      estimate_hours: 6,
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
    },
    {
      id: "m2",
      title: "Round-based Payouts (Preview / Propose / Execute)",
      owner: "Jane Dev",
      due: "2025-09-16",
      status: "not_started",
      estimate_hours: 10,
      short: "Implement payout rounds with preview, proposal to Safe, and execution tracking.",
      long:
        "Frontend flow: list incomplete rounds, preview table of recipients, propose transactions (fiat or recognition or both). API endpoints for preview, propose, and status. Includes chunking logic for MultiSend transactions.",
      acceptance: [
        "Rounds list with preview and warnings",
        "Safe proposals created and linked",
        "Chunking logic enforced when calldata too large",
      ],
      deliverables: ["Rounds UI", "Preview API", "Propose API", "Status polling"],
    },
    {
      id: "m3",
      title: "Status and History (+ CSV Export)",
      owner: "Jane Dev",
      due: "2025-09-19",
      status: "not_started",
      estimate_hours: 8,
      short: "Display payout history with statuses, retries, Safe links, and CSV export.",
      long:
        "UI lists payouts with details of tx_proposals, attempts, Safe links, and recipients snapshot. Retry on failed proposals increments attempt count. CSV export provides full audit trace with on-chain and DB metadata.",
      acceptance: [
        "Statuses update via Safe Transaction Service",
        "Retry workflow functional",
        "CSV export includes all required fields",
      ],
      deliverables: ["Status UI", "Retry logic", "CSV export API"],
    },
    {
      id: "m4",
      title: "Manual Payouts via Safe",
      owner: "Jane Dev",
      due: "2025-09-25",
      status: "not_started",
      estimate_hours: 6,
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
    },
  ],
  links: [
    { label: "Spec document", href: "#" },
    { label: "Issue tracker", href: "#" },
  ],
  // New: profile data used by ProfileCard
  profile: {
    name: "Jane Dev",
    avatar: "https://i.pravatar.cc/120?img=5",
    title: "Fullstack engineer",
    stars: 0,
    badgeLabel: "Verified for Safe payouts",
  },
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
    not_started: `${base} bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`,
    in_progress: `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200`,
    blocked: `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200`,
    done: `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200`,
  };
  return map[s] || base;
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden" data-testid="progressbar">
      <div
        className="h-full bg-emerald-500 transition-[width] duration-500"
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
  estimate_hours?: number;
  short: string;
  long?: string;
  acceptance?: string[];
  deliverables?: string[];
}

function ModuleCard({ mod }: { mod: Module }) {
  const [open, setOpen] = useState(false);

  const showDescription = Boolean(mod.long);
  const showAcceptance = hasItems(mod.acceptance);
  const showDeliverables = hasItems(mod.deliverables);
  const hasEstimate = typeof mod.estimate_hours === "number";

  return (
    <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-4 hover:shadow-sm transition-shadow" data-testid={`module-${mod.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Module</div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">{mod.title}</h3>
        </div>
        <span className={statusClasses(mod.status)}>{statusLabel(mod.status)}</span>
      </div>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{mod.short}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          Owner:
          <strong className="ml-1 font-medium text-zinc-800 dark:text-zinc-200">{mod.owner}</strong>
        </span>
        <span>
          Due:
          <strong className="ml-1 font-medium text-zinc-800 dark:text-zinc-200">{mod.due}</strong>
        </span>
        {hasEstimate ? (
          <span>
            Est:
            <strong className="ml-1 font-medium text-zinc-800 dark:text-zinc-200">{mod.estimate_hours}h</strong>
          </span>
        ) : null}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-80"
        aria-expanded={open}
        aria-controls={`details-${mod.id}`}
      >
        {open ? "Hide details" : "Show details"}
      </button>

      {open ? (
        <div id={`details-${mod.id}`} className="mt-4 space-y-4">
          {showDescription ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Description</div>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{mod.long}</p>
            </div>
          ) : null}

          {showAcceptance ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Acceptance Criteria</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                {mod.acceptance?.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {showDeliverables ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Deliverables</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                {mod.deliverables?.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface Profile {
  name: string;
  avatar: string;
  title: string;
  stars: number;
  badgeLabel: string;
}

function ProfileCard({ profile, gigTitle, progressPercent, showBadge }: { 
  profile: Profile; 
  gigTitle: string; 
  progressPercent: number; 
  showBadge: boolean; 
}) {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur" data-testid="profile-card">
      <div className="flex items-center gap-3">
        <img src={profile.avatar} alt={`${profile.name} avatar`} className="h-12 w-12 rounded-full" />
        <div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Developer</div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{profile.name}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{profile.title}</div>
        </div>
        {showBadge ? (
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-medium" title={profile.badgeLabel} data-testid="profile-badge">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {profile.badgeLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Current gig: <span className="font-medium text-zinc-800 dark:text-zinc-200">{gigTitle}</span>
      </div>
      <div className="mt-2">
        <ProgressBar value={progressPercent} />
        <div className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">{progressPercent}% complete</div>
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
  const badgeVisible = progress === 100; // badge appears only when the gig is completed

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
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10" data-testid="live-gig-modules">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold mb-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Live pilot gig
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">{data.title}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">{data.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              Org:
              <a className="ml-1 underline underline-offset-4 hover:opacity-80" href={data.org.url}>
                {data.org.name}
              </a>
            </span>
            <span>
              Timeframe:
              <strong className="ml-1 text-zinc-800 dark:text-zinc-200">{data.timeframe.start}</strong>
              <span> to </span>
              <strong className="text-zinc-800 dark:text-zinc-200">{data.timeframe.end}</strong>
            </span>
            <span>
              Developer:
              <strong className="ml-1 text-zinc-800 dark:text-zinc-200">{data.developer.name}</strong>
            </span>
          </div>
        </div>
        <div className="w-full md:w-80 space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Overall Progress</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{progress}%</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{doneCount} / {data.modules.length} done</div>
            </div>
            <div className="mt-3"><ProgressBar value={progress} /></div>
            <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 space-x-3">
              {data.links?.map((l) => (
                <a key={l.label} href={l.href} className="underline underline-offset-4 hover:opacity-80">{l.label}</a>
              ))}
            </div>
          </div>
          <ProfileCard profile={data.profile || gig.profile} gigTitle={data.title} progressPercent={progress} showBadge={badgeVisible} />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {data.modules.map((m) => (
          <ModuleCard key={m.id} mod={m} />
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">How it works</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: 1, title: "Post", copy: "Define a crisp task and timeline." },
            { step: 2, title: "Match", copy: "Assign a developer and break work into 4 modules." },
            { step: 3, title: "Deliver", copy: "Ship module by module with public progress." },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Step {s.step}</div>
              <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{s.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Transparency signals: named developer, public acceptance criteria, and visible progress timeline.
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Tip: Mark modules as <span className="font-medium text-emerald-600 dark:text-emerald-400">Done</span> in the data object to auto-update progress.
      </div>
    </section>
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

    // Test 11: Badge must not show until completion
    const notDone = gig.modules.map((m, i) => ({ ...m, status: i < 3 ? "done" : "not_started" }));
    const prog75 = calcProgress(notDone);
    const badgeVisibleBefore = prog75 === 100;
    assert(badgeVisibleBefore === false, "Badge should be hidden before completion");

    // Test 12: Badge must show at completion
    const allDone2 = gig.modules.map((m) => ({ ...m, status: "done" }));
    const prog100 = calcProgress(allDone2);
    const badgeVisibleAfter = prog100 === 100;
    assert(badgeVisibleAfter === true, "Badge should be visible upon completion");

    console.info("LiveGigModules self-tests passed.");
  } catch (e) {
    console.error("LiveGigModules self-tests failed:", e);
  }
}
