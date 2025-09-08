### CollabBerry: Token Payments via Safe Multisig (Spec)

This document outlines the technical specification for **CollabBerry**, a system for processing token payments using a SAFE multisig. The system consists of four key modules: Admin Configuration, Payouts, Status & History, and Manual Payouts.

---

### 🍓 Scope & Core Primitives

This spec details the functionality for managing **round-based payouts** and **manual transfers** through a **Safe multisig wallet**. The system handles stablecoin and recognition token payments.

---

#### 🛠️ Core Primitives

* **Safe Protocol Kit**: Used to build and batch multiple transactions into a single `MultiSend` transaction.
* **Safe API Kit / Transaction Service**: Manages the lifecycle of transactions, including proposing them, gathering confirmations, and tracking their execution status.
* **OpenZeppelin ERC-20 & AccessControl**: Ensures accurate token decimal conversion and manages `MINTER_ROLE` for the recognition token.

---

### ⚙️ Module A: Admin Configuration

This module allows an administrator to configure the system. The UI provides selectors for the blockchain network, the Safe address, the stablecoin address, and the recognition mode (**TeamPoints mint** or **DAO token transfer**).

The backend validates that the Safe and token addresses are correct. If the recognition mode is set to "TeamPoints mint," it verifies that the Safe holds the `MINTER_ROLE` for the recognition token contract, ensuring it has the authority to mint new tokens.

---

### 💸 Module II: Payouts (Preview → Propose → Sign → Execute)

This module manages the primary workflow for processing scheduled payouts.

#### Frontend Flow

1.  **Rounds List**: Displays a list of incomplete payout rounds.
2.  **Preview**: Presents a table showing recipient details, payment amounts, and a summary of totals and warnings.
3.  **Actions**: Buttons allow the creation of transactions for stablecoin, recognition tokens, or both.
4.  **Post-Propose**: After a proposal is created, a link to the pending transaction on the Safe UI is shown, with the status automatically updating.

#### API Endpoints

* **`GET /payouts/rounds`**: Lists incomplete payout rounds.
* **`GET /payouts/preview`**: Provides a detailed preview of a specific round, including recipient lists and pre-flight checks.
* **`POST /payouts/propose`**: Initiates the payout process. It builds a batched transaction, proposes it to the Safe, and returns the Safe transaction link.
* **`GET /payouts/status`**: Polls the Safe Transaction Service to update the status of proposals.

#### Chunking Logic

To avoid exceeding gas limits or transaction size caps, the system automatically **chunks** large payouts. It splits a single payout into multiple smaller `MultiSend` transactions if the total gas or calldata exceeds a predefined limit. Each chunk is tracked as a separate proposal.

---

### 📈 Module III: Status & History (+ Export)

This module provides an overview of all payouts and their statuses, offering a full audit trail.

#### UI Features

* **Payouts List**: Displays all payouts with statuses like **Pending**, **Executed**, **Partial**, or **Failed**.
* **Details**: Shows information for each payout, including the individual `tx_proposals`, their statuses, and Safe links.
* **Retry**: A "Retry" button allows a user to create a new transaction for a failed proposal.
* **Export CSV**: Provides a CSV export of each payout.

#### Export API

* **`GET /payouts/:payoutId/export`**: Returns a CSV file containing all relevant data for a specific payout. The CSV includes details like `safe_tx_hash`, `status`, `explorer_url`, recipient wallet addresses, and amounts.

---

### 🤝 Module IV: Manual Payouts

This module enables ad-hoc, one-off payments using the same Safe multisig flow. It follows the same logic, validations, chunking, and tracking as the round-based payouts (Module II), ensuring all manual transactions are subject to the same **multisig governance** and are fully traceable.

---

### 📄 Data Model

The system uses three main data models to track all payout information:

* **`payouts`**: Stores high-level payout information, including status and total amounts.
* **`tx_proposals`**: Represents individual transaction proposals sent to the Safe. Each proposal can be a chunk of a larger payout.
* **`payout_recipients`**: An immutable snapshot of each recipient's details at the time of the payout, including their wallet address and the amount they are to receive.

---

### 🚀 Milestones & Acceptance Criteria

The project will be delivered in four milestones, corresponding to each module.

#### Global Acceptance Criteria

* All transactions must be created using the **Safe SDKs** and require signing via the **Safe UI**.
* All token amounts must be converted accurately using their respective **`decimals()`**.
* TeamPoints can only be minted if the Safe holds the `MINTER_ROLE`.
* The **chunking logic** must be enforced to prevent transaction failures.
* **CSV exports** must provide a complete, fully traceable audit trail.