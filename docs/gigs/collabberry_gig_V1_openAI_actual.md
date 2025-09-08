# CollabBerry - Token Payments via SAFE Multisig (Spec)

## Scope (what this delivers)
- **Admin configuration (Module A)** - Set Safe, stablecoin, and recognition mode (TeamPoints mint or DAO token transfer).  
- **Payouts (Module II)** - Workflow: *Preview → Propose → Sign → Execute* for round-based distributions (stablecoin + TP/DAO).  
- **Status & History (Module III)** - Show chunked proposals per payout, Safe links, execution states, and **Export CSV**.  
- **Manual payouts via Safe (Module IV)** - Ad-hoc transfers/mints with the same Safe flow, tracked & exportable.

### Core primitives used
- **Safe Protocol Kit** - Build batched MultiSend transactions via `createTransaction([...MetaTransactionData])`. Supports arrays of calls.  
  
- **Safe API Kit / Transaction Service** - Propose, collect confirmations, and track execution status.  
  
- **OpenZeppelin ERC-20 & AccessControl** - Always read `decimals()` (do not assume 18); manage roles (`hasRole`, `grantRole`) for TP minting.  
  

---

## Module A - Admin Configuration (Safe & Tokens) [Recap]
- **UI**: Chain selector, Safe address, Stablecoin address, Recognition mode (TeamPoints mint | DAO token).  
- **Backend validation**:
  - Safe is a contract; (optionally) sanity-check via Safe Transaction Service.  
  - Token is ERC-20; fetch and cache `decimals()`.  
  - If TeamPoints (mint): Safe must have `MINTER_ROLE`. Enforce using AccessControl.  
- **Why**: Ensures correctness for batched payouts using Safe. 

---

## Module II - Payouts (Preview → Propose → Sign → Execute)

### Frontend Flow
1. **Rounds list** - Incomplete payoff rounds.  
2. **Preview** - Table: members, stable & recognition amounts, totals, warnings (balance & role checks).  
3. **Actions** - Buttons for “Create fiat transaction” and “Create recognition transaction.” Optional “Create both.”  
4. **Post-propose** - Show “Pending in Safe” link; status auto-updates to Executed/Failed.

### API Endpoints
- **GET** `/payouts/rounds?orgId=` → List incomplete rounds.  
- **GET** `/payouts/preview?roundId=` → Recipient list (human + base-unit), totals, preflight checks (balance, role), and chunk plan.  
- **POST** `/payouts/propose` `{ roundId, tokenType }` → Build batched calls, create Safe transaction, propose it, store proposal, return Safe link.   
- **GET** `/payouts/status?roundId=` → Poll Transaction Service for statuses; update records accordingly.  

### Chunking logic (dev one-liner)
> “Build a batched Safe MultiSend of up to N recipients, `estimateGas`; if gas or calldata exceeds cap, split and re-estimate recursively until ≤ cap; store chunks as `tx_proposals` with `partIndex/partCount`.”  
  

### Server-side Validations
- Wallet address validation and dedupe.  
- Convert amounts using real `decimals()`.  
- Balance checks for transfers; TP mint requires Safe to hold `MINTER_ROLE`. 

---

## Module III - Status & History (+ Export)

### UI
- List payouts with status (Pending / Executed / Partial / Failed).  
- Details: show `tx_proposals` (tokenType, chunk info, attempt, status, Safe link, timestamps), and recipients snapshot.  
- **Retry** on failed proposals: creates new slot with `attempt+1` and links back to original.  
- **Export CSV** of each payout.

### Export API
```javascript
Returns `text/csv` with columns:
round_id, payout_type, token_type, part_index, part_count, attempt,
safe_tx_hash, status, proposed_at, executed_at, explorer_url,
wallet_address, amount_human, amount_base_units, recipient_status, error
YAML

**Why**: Combines on-chain Safe metadata and DB snapshots for full audit trace. 
Module IV - Manual Payouts via Safe (Enabled)
Approach: Allow manual payouts (stablecoin & TP mint) via Safe flow.

Requirements: Safe must have MINTER_ROLE to mint TP.

Identical validations, chunking, proposals, status, and exports as Module II.

Why via Safe: Maintains multisig governance and trace.

Data Model (Final)
payouts
Shell

id (uuid pk),
organization_id (fk),
round_id (nullable),
status (draft|proposed|executed|partial|failed),
total_stable_payout,
total_recognition_payout,
timestamps
tx_proposals
Shell

id (uuid pk),
payout_id (fk),
payout_type ('round'|'manual'),
token_type ('stablecoin'|'recognition'),
part_index (int),
part_count (int),
attempt (int, default 1),
retry_of_tx_proposal_id (uuid, nullable),
safeTxHash,
status (proposed|executed|failed|canceled),
proposed_at,
executed_at,
payload_json,
explorer_url
Mirrors Safe TS for status.

payout_recipients
PostgreSQL & PL/pgSQL

id,
payout_id,
round_compensation_id (nullable),
user_id,
wallet_address_snapshot,
token_type,
token_address_snapshot,
token_decimals_snapshot,
amount_human,
amount_base_units,
tx_proposal_id,
part_index,
part_count,
attempt (int, default 1),
status (pending|proposed|executed|failed|skipped),
error,
timestamps
Immutable per-recipient snapshot.

Milestones & Deliverables
Module A - Admin Config setup & validation.

Module II - Round-based payouts via Safe: Preview, Propose, Sign, Execute.

Module III - Status tracking, retry, and CSV export.

Module IV - Manual payouts (stable & TP) via Safe.

Global Acceptance Criteria
All proposals created with Safe SDKs and signed via Safe UI.

Accurate token decimal conversion.

TP minting only when Safe holds rights.

Chunking logic enforced.

CSV exports fully traceable.