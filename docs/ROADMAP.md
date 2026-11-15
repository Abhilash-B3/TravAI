# Nexgile-TravAI: Phased Engineering Roadmap

## Phase 0: Architecture & Baseline Constitution (Current)
* Formalize Master Product Constitution and Requirements Baseline.
* Initialize project documentation and architecture standards.
* Establish ADRs, domain models, and technical governance.

## Phase 1: Core Domain Engine & Database Schemas (MVP)
* Implement PostgreSQL schema models, migrations, and seed scripts.
* Implement Multi-Tenant resolution middleware and Scoped RBAC engine.
* Implement Cloud PMS Core: Property configuration, Room inventory, Central Reservation Calendar, Guest Profiles, Folio & Billing engine.
* Implement Role-Specific Dashboards (Front Desk, Property Admin, Revenue Manager, Corporate Traveler).
* Implement Server-Side Gemini AI integration for dynamic pricing assistance with human-in-the-loop review.

## Phase 2: Distribution, Corporate Travel & Expense Management (V1)
* Implement Channel Manager & Adapter interfaces (OTA / GDS mock connectors, rate sync, stop-sell controls).
* Implement Corporate Travel Portal: Policy compliance engine, multi-tier approval workflows, budget tracking.
* Implement AI Expense Management: Receipt OCR via Gemini, policy rule checks, folio reconciliation.
* Implement Mobile Super App traveler experience: Trip itineraries, digital key simulation, loyalty tier tracker.

## Phase 3: Marketplace Scale, Advanced AI & Global Enterprise (V2)
* Multi-vertical travel marketplace (Flights, Vacation Rentals, Car Rentals, Tours, Dynamic Packages).
* High-volume channel scaling architecture (targeting 20,000+ channels and 1M+ travel products).
* Real-time conversational AI guest concierge (multilingual SMS, WhatsApp, voice interfaces).
* Duty of Care real-time traveler tracking and global risk telemetry.
* Advanced BI & Automated Financial Reconciliation with ERP integrations.
