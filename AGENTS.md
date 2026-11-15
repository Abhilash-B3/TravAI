# NEXGILE-TRAVAI: AGENT DIRECTIVES & ARCHITECTURAL CONSTITUTION

## PERMANENT REAL-DATA, ZERO-MOCK & PRODUCTION-FUNCTIONALITY CONSTITUTION

This rule applies to EVERY future development stage, module, feature, screen, API, database operation, integration, AI capability, workflow, report, dashboard, notification, and user journey in Nexgile-TravAI.
It is a NON-NEGOTIABLE PRODUCT ENGINEERING REQUIREMENT.

---

### 1. ZERO-MOCK PRODUCTION POLICY
Nexgile-TravAI must be implemented as a genuinely functional application.
Do NOT use mock functionality to make an unfinished feature appear complete.
Do NOT use:
* hard-coded business data
* fake API responses
* mock JSON responses
* fake database repositories
* frontend-only persistence
* static dashboard numbers
* simulated booking confirmations
* simulated payment success
* simulated inventory availability
* fake reservation records
* fake financial transactions
* fake integration responses
* random/generated fake production records
* artificial delays pretending to represent APIs
* placeholder functions that return successful results
* fake AI responses presented as real AI
* fake notifications presented as delivered notifications
* fake synchronization presented as successful integration
* fake analytics presented as calculated analytics

If a feature is not actually implemented, it must NOT be presented as implemented.

---

### 2. AUTHORITATIVE DATA FLOW
The canonical architecture is:
```text
React Frontend (JavaScript / JSX only, strictly zero TypeScript)
      ↓
FastAPI REST/API Layer (Python 3.11+, Pydantic v2)
      ↓
Application Services
      ↓
Domain Logic
      ↓
Repositories
      ↓
PostgreSQL (Sole authoritative transactional source of truth)
```
* PostgreSQL is the authoritative transactional source of truth.
* Frontend state is NOT the source of truth.
* Browser storage is NOT the source of truth.
* Redis is NOT the source of truth for transactional inventory.
* Caches are NOT the source of truth.

---

### 3. REAL CRUD REQUIREMENT
Every implemented CRUD feature must perform real operations:
* **Create:** Frontend → API → validation → authorization → business rules → database transaction → persistence → response.
* **Read:** Frontend → API → authorization → database query → real persisted data → response.
* **Update:** Frontend → API → authorization → concurrency validation → business rules → database transaction → persistence → response.
* **Delete/Cancel:** Use appropriate domain semantics (cancellation, voiding, reversal, archival, soft deletion, audit preservation). Never physically delete records when domain requires audit trails.

---

### 4. NO FRONTEND FAKE STATE
React state may represent:
* UI state
* loading state
* temporary form state
* selected filters
* current view
* cached query state

React state must NEVER pretend to be the authoritative business database (e.g. no hardcoded `const reservations = [...]`). Queries must fetch from real backend APIs.

---

### 5. NO FAKE SUCCESS
Never return or display `success: true` or "Confirmed" merely because a button was clicked. Success must correspond to a real, committed database transaction or confirmed provider operation.

---

### 6. EXTERNAL INTEGRATIONS
External integrations must be genuine. When credentials or provider access are unavailable, report explicitly:
`STATUS = NOT CONFIGURED` or `STATUS = BLOCKED — PROVIDER CREDENTIALS REQUIRED`. Never simulate provider responses.

---

### 7. DEVELOPMENT FIXTURES
Development fixtures are allowed ONLY for creating real records in PostgreSQL (e.g., `dev_seed.py` inserting rows into database tables). Frontend must query the database, never a hardcoded fixture array.

---

### 8. REAL-TIME ARCHITECTURE
Use appropriate communication patterns (standard request/response, controlled polling, SSE, WebSockets, transactional outbox) based on actual domain needs—never for marketing theater.

---

### 9. REAL-TIME CONSISTENCY
UI must reflect authoritative backend state. Never mutate other users' UI via local client memory.

---

### 10. DATABASE-FIRST BUSINESS STATE
All business entities (reservations, bookings, stays, rooms, inventory, rates, payments, refunds, folios, expenses, loyalty points, tasks, audit logs) must have authoritative backend persistence.

---

### 11. AI GOVERNANCE (GEMINI)
All Gemini calls must execute server-side in Python FastAPI services with structured validation and rate limiters. If credentials are missing: `AI STATUS = NOT CONFIGURED`. Never fabricate canned AI responses in frontend code.

---

### 12. CALCULATED ANALYTICS
Every KPI must be calculated from actual database records, specifying data source, calculation logic, time range, and refresh timestamp.

---

### 13. SEARCH
Search must query real persisted database data or indexed materialized views.

---

### 14. NOTIFICATIONS
Track real delivery lifecycle states (`PENDING`, `PROCESSING`, `SENT`, `DELIVERED`, `FAILED`, `CANCELLED`).

---

### 15. BACKGROUND JOBS
Background workers (holds reaper, outbox publisher, reconciler) must execute real operations against real databases/services.

---

### 16. CONCURRENCY & TRANSACTIONS
Critical mutations (inventory, booking, folios, payments) must utilize database transactions, row-level locks, and idempotency keys.

---

### 17. ERROR HANDLING
Never convert errors into fake success. Record failures accurately.

---

### 18. CONFIGURATION-DEPENDENT FEATURES
Explicitly flag unconfigured external capabilities as `NOT CONFIGURED` or `CONFIGURATION REQUIRED`.

---

### 19. IMPLEMENTATION STATUS DISCIPLINE
Valid statuses:
`PLANNED` | `DESIGNED` | `IMPLEMENTED` | `CONNECTED` | `PERSISTED` | `INTEGRATED` | `TESTED` | `PRODUCTION-READY` | `BLOCKED` | `NOT CONFIGURED`.
Never use `COMPLETE` unless UI, API, Business Logic, Database, Real Data, Error Handling, Auth, Auditability, and Tests are all fully executed.

---

### 20. FEATURE COMPLETION GATE
A feature is complete ONLY when:
`UI → API → Business Logic → Database → Real Data → Error Handling → Authorization → Auditability → Tests` are fully implemented.

---

### 21. NO PLACEHOLDER UI
Never build polished UI screens with fake operational data. If a screen exists before backend implementation, clearly label it:
`FEATURE NOT YET IMPLEMENTED`.

---

### 22. NO SILENT FALLBACKS
Never silently fall back to mock data or fake success upon API failure.

---

### 23. DATA PROVENANCE
Maintain traceability (`source`, `created_at`, `created_by`, `external_reference`, `source_system`).

---

### 24. REAL-DATA TESTING
Unit tests test isolated logic with controlled fixtures; integration tests test real application/database behavior.

---

### 25. MANDATORY VALIDATION REPORT AT TURN COMPLETION
At the end of every development stage, report the exact status block:
```text
REAL DATA:
YES / NO / PARTIAL

DATABASE PERSISTENCE:
YES / NO / PARTIAL

REAL API:
YES / NO / PARTIAL

REAL-TIME:
YES / NO / NOT REQUIRED

EXTERNAL INTEGRATIONS:
LIST ACTUAL CONNECTED PROVIDERS

MOCK DATA:
NONE / LIST EXACT LOCATIONS

MOCK FUNCTIONALITY:
NONE / LIST EXACT LOCATIONS

HARDCODED BUSINESS DATA:
NONE / LIST EXACT LOCATIONS

PLACEHOLDER FEATURES:
NONE / LIST EXACT LOCATIONS

TEST STATUS:
ACTUAL EXECUTED RESULTS ONLY
```

---

### 26. CORE PRINCIPLE
Build a genuinely functional, production-grade travel and hospitality platform backed by real systems and real data.
Always prefer **one real working feature** over **ten simulated features**.
