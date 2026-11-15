# Nexgile-TravAI: Product Requirements Baseline

## 1. Product Identity & Purpose
* **Product Name**: Nexgile-TravAI
* **Classification**: Enterprise AI-Enabled Travel & Hospitality SaaS / Multi-Tenant Property Operations Platform / Global Travel Marketplace
* **Primary Mission**: Unify hospitality property operations (PMS), dynamic revenue management, multi-channel distribution (20,000+ target channels), multi-vertical marketplace booking (1M+ product target scale), hyper-personalized AI guest concierge, corporate travel management, expense tracking, and operational intelligence into a single coherent, modular cloud platform.

## 2. Requirement Classification Framework
* **CONFIRMED**: Requirements directly specified in the master specification.
* **INFERRED**: Technical assumptions and architectural mechanisms required to satisfy confirmed requirements without violating system boundaries.
* **RECOMMENDED**: Engineering improvements, optimizations, and modern best practices proposed by the architecture team for future evaluation.

## 3. Core Functional Domains
### A. Cloud Property Management System (PMS)
* Front desk workflows: Check-in, check-out, room allocations, walk-ins, digital key tokenization.
* Guest profiles, multilingual communication, preferences, consent & GDPR/CCPA flags.
* Central reservation calendar, group blocks, corporate rates, waitlists, upgrades, cancellations.
* Housekeeping & room readiness: live status (clean/dirty/inspected/out-of-order), staff scheduling, task dispatch.
* Maintenance cases: tracking, urgency, room downtime isolation.
* Billing & Financials: multi-currency folios, itemized invoices, split billing, tax engines, audit trails.

### B. Dynamic Revenue Management
* AI demand forecasting incorporating historical pace, seasonality, macro trends, and local event signals.
* Algorithmic rate recommendations with mandatory human review guardrails (min/max clamps, manual overrides, override auditing).
* Core metrics tracking: Occupancy, Average Daily Rate (ADR), Revenue per Available Room (RevPAR), Booking Pace, Profit Contribution.

### C. Distribution & Channel Management
* Central reservation system (CRS) inventory syncing, allotments, rate parity enforcement, and stop-sell controls.
* Connectivity adapters for OTAs, GDS, metasearch, wholesalers, and corporate booking tools (scale target: 20,000+ channels).
* Overbooking prevention using distributed reservations, lock queues, and idempotent sync events.

### D. Travel Marketplace
* Multi-vertical search: Hotels, Vacation Rentals, Flights, Car Rentals, Restaurants, Tours, Transfers, Dynamic Packages.
* Normalized catalog schema: unified taxonomy, policies, amenities, media, and multi-supplier pricing.
* Cart, availability re-checks, price-freeze holds, booking confirmation, vouchers, and automated disruption handling.

### E. AI Guest Experience & Concierge
* Pre-arrival: personalized itinerary recommendations, transfers, dietary/room preference onboarding.
* In-stay: digital concierge (app/SMS/WhatsApp/email), room service orders, service ticket tracking, local curated guides.
* Post-stay: automated sentiment surveys, review aggregation, service recovery dispatch.
* Human-in-the-loop: AI recommendations must never execute irreversible operational or financial actions without explicit approval or policy checks.

### F. Corporate Travel & Expense Management
* Corporate accounts, travel policies, tier-based approval workflows, budget caps, duty-of-care live tracking.
* Receipt capture, AI OCR/field extraction, expense classification, VAT recovery tracking, and corporate card reconciliation.

### G. Analytics, BI & Reporting
* Operational rollups: staff productivity, room turnaround, guest satisfaction scores (CSAT/NPS).
* Revenue rollups: pace, ADR, RevPAR, channel commission drag vs net revenue contribution.
* Exportable reports: PDF, CSV, Excel with scheduled distribution and saved filter presets.
