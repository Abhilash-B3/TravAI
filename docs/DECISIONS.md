# Nexgile-TravAI: Architecture Decision Records (ADRs)

## ADR-001: Architectural Pattern — Modular Monolith
* **Context**: The platform encompasses PMS, revenue management, distribution, marketplace, corporate travel, and AI concierge across multiple tenants. Microservices introduced at inception would create excessive distributed transaction overhead, network latency, and operational fragility.
* **Decision**: Adopt a Modular Monolith architecture in Node.js/TypeScript with strict directory boundaries, distinct domain services, clean interfaces, and an event-driven core.
* **Consequences**: Fast development velocity, single transactional database, simple testing, with clear isolation allowing future extraction into standalone microservices when domain volume justifies.

## ADR-002: Relational Database Source of Truth — PostgreSQL
* **Context**: The platform requires strict ACID consistency for inventory availability, room allocations, guest folios, payment captures, and audit trails.
* **Decision**: Use PostgreSQL as the primary transactional database with composite tenant keys, foreign key constraints, row-level security (RLS), and optimistic locking.
* **Consequences**: High transactional reliability, zero ghost bookings or double charges; NoSQL is deferred to specialized read caches or document archives if necessary.

## ADR-003: AI Integration & Server-Side Security
* **Context**: Gemini AI capabilities are required for dynamic pricing reasoning, receipt OCR, guest concierge, and review sentiment analysis.
* **Decision**: Restrict all Gemini API operations to the server-side runtime via `@google/genai` SDK using `process.env.GEMINI_API_KEY`. Enforce structured JSON outputs and human-in-the-loop overrides.
* **Consequences**: Zero client credential leakage, strict deterministic guardrails on AI suggestions, complete auditability.

## ADR-004: Decoupled Multi-Tenant Identity & RBAC Model
* **Context**: Users may hold different responsibilities across organizations, brands, properties, and corporate travel accounts.
* **Decision**: Decouple `User` identities from `Role` assignments through scoped associations (`UserRoleAssignment` bound to `OrganizationId`, `PropertyId`, or `CorporateAccountId`).
* **Consequences**: Extreme flexibility supporting complex enterprise hierarchies without requiring redundant user table records.

## ADR-005: Technology Stack Correction — Python FastAPI & React.js (JavaScript / JSX)
* **Context**: Enterprise specifications for Nexgile-TravAI strictly mandate a Python-based backend runtime for deep analytical, data science, and AI interoperability, paired with a pure JavaScript (JSX) React frontend without TypeScript overhead.
* **Decision**: 
  - Backend: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (async/sync), Alembic migrations.
  - Frontend: React.js, JavaScript only (`.js`/`.jsx`), strictly NO TypeScript (`.ts`/`.tsx`).
  - Database: PostgreSQL (relational source of truth).
  - AI: Google Gemini SDK executed server-side in Python (`google-genai`).
* **Consequences**: Strict technological compliance across all development stages. Node.js backend code and TypeScript files are permanently deprecated and prohibited.

## ADR-006: Connection Pool RLS Session Sanitation
* **Context**: In an async connection-pooled environment, executing `SET LOCAL app.current_org_id` inside an active transaction safely sets the session variable, but if a transaction fails or a connection is returned uncleanly, state could theoretically leak to a subsequent tenant request.
* **Decision**: Enforce an automatic connection checkin event listener on the SQLAlchemy engine that executes `DISCARD TEMP; RESET ALL;` upon every connection return, guaranteeing zero cross-tenant contamination.
* **Consequences**: Provable, zero-leakage multi-tenancy at the database driver level.

## ADR-007: Transactional Outbox Pattern for Asynchronous Domain Events
* **Context**: Cross-module notifications, distribution channel synchronization (20,000+ OTA channels), and external billing webhooks cannot participate in two-phase commits without creating high latency and coupling.
* **Decision**: Implement a Transactional Outbox table (`sys_governance.outbox_events`). Domain mutations insert outbox records within the same transaction. An asynchronous worker polls with `FOR UPDATE SKIP LOCKED` to dispatch events reliably.
* **Consequences**: Guaranteed at-least-once delivery with complete decoupling of downstream distribution systems.

## ADR-008: Request Idempotency via SHA-256 Payload Hashing
* **Context**: Network retries, timeout reconnections, or dual-clicks during checkout, booking, or folio payment processing could result in duplicate financial mutations or overselling.
* **Decision**: Require an `Idempotency-Key` header on all mutation endpoints. The server records the key along with a SHA-256 hash of the request payload and the response in `sys_governance.idempotency_records` with a 48-hour TTL. Duplicate identical requests return the cached response; conflicting payloads under the same key fail with HTTP 409.
* **Consequences**: Protection against duplicate financial transactions and double bookings.

## ADR-009: Strict Ban on Ephemeral Secrets & Payment Card PAN Persistence
* **Context**: PCI-DSS compliance strictly forbids the storage of raw card account numbers (PAN), CVV/CVC verification codes, or gateway client secrets in primary database tables.
* **Decision**: Only store gateway transaction identifiers, payment method provider tokens, last 4 digits, expiration month/year, and card brand in `finance_billing.payment_transactions`. Ephemeral authentication secrets are never written to disk or logs.
* **Consequences**: Immediate alignment with PCI-DSS Level 1 compliance requirements.

