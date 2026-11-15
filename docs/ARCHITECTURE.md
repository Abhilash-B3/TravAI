# Nexgile-TravAI: System Architecture

## 1. High-Level Architecture
Nexgile-TravAI adopts a **Modular Monolith** architecture pattern with strict domain boundaries, event-driven decoupling for asynchronous operations, and stateless REST API interfaces. This ensures high operational velocity during early phases while preserving a clean migration path toward distributed services or microservices when scaling requirements mandate.

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER                                   |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion Layouts    |
|   - Role-Specific Dashboards (Front Desk, Revenue Mgr, Corporate, Traveler)      |
|   - Mobile Super App Shell (Itinerary, Wallet, Digital Keys, Concierge Chat)      |
+-----------------------------------------------------------------------------------+
                                         |
                                (REST HTTPS / WSS)
                                         v
+-----------------------------------------------------------------------------------+
|                             API GATEWAY & SECURITY                                |
|   Express 4/5 Routing + Centralized RBAC + Tenant Resolution + Idempotency Guard  |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                            MODULAR DOMAIN SERVICES                                |
|  [PMS Module]       [Revenue Engine]     [Distribution Engine]  [Marketplace Hub]  |
|  - Reservations     - Demand Forecast    - 20K Channel Registry - Multi-Vertical   |
|  - Folio & Billing  - Dynamic Pricing    - Rate Parity & Sync   - Cart & Checkout  |
|  - Housekeeping     - Override History   - Allotment Manager    - Disruption Eng.  |
|                                                                                   |
|  [Corporate Travel] [Expense Module]     [AI Guest Concierge]   [BI & Reporting]   |
|  - Policy Engine    - OCR / Extraction   - Gemini Assistant     - Operational KPIs |
|  - Approval Matrix  - Reconciliation     - Multi-Channel Comms  - RevPAR / ADR     |
+-----------------------------------------------------------------------------------+
         |                                |                               |
         v                                v                               v
+------------------+             +------------------+            +------------------+
|  DATABASE TIER   |             |   INTEGRATIONS   |            |   AI PLATFORM    |
|  PostgreSQL 15+  |             |  Adapter Engine  |            |  Google Gemini   |
|  - Multi-tenant  |             |  - OTA / GDS /   |            |  SDK (Server)    |
|  - ACID Folios   |             |    Bedbanks      |            |  - Structured    |
|  - Row Locking   |             |  - Payment / POS |            |    Outputs / RAG |
|  - Audit Trails  |             |  - SMS / WhatsApp|            |  - Human Review  |
+------------------+             +------------------+            +------------------+
```

## 2. Structural Layer Responsibilities
1. **Frontend**: Feature-grouped modules (`src/features/*`), shared component library, centralized API clients, reactive UI with strict role-based views.
2. **API & Middlewares**: Multi-tenant resolution (`X-Organization-Id`, `X-Property-Id`), session authentication, RBAC authorization matrices, rate limiting, and request tracing.
3. **Core Services**: Pure domain logic, transactional state transitions, inventory atomicity, and event dispatching.
4. **Integration Gateway**: Adapter pattern isolating external vendor protocols (OTA XML, Sabre/Amadeus GDS, Stripe, Twilio) from internal domain representations.
5. **Persistence**: Relational source of truth in PostgreSQL with foreign keys, composite tenant indices, optimistic locking for reservations, and append-only audit tables.
