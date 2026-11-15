# Nexgile-TravAI: REST API Domain Contracts

## 1. Routing Conventions & Standards
* Base URL: `/api/v1`
* Standard headers:
  * `Authorization: Bearer <jwt_token>`
  * `X-Organization-Id: <uuid>` (mandatory for enterprise multi-tenancy)
  * `X-Property-Id: <uuid>` (required for property-scoped operations)
  * `Idempotency-Key: <unique_client_token>` (required for booking, checkout, and refund endpoints)
* Standard response envelope:
```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2026-09-08T07:30:00Z", "requestId": "req_839df" }
}
```
* Standard error envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERR_INVENTORY_UNAVAILABLE",
    "message": "The selected room type is sold out for the given date range.",
    "details": []
  }
}
```

## 2. API Domain Endpoints Overview
* `/api/v1/auth`: Login, refresh token, MFA challenge, profile resolution.
* `/api/v1/organizations`: Organization management, brand and property listing.
* `/api/v1/properties`: Property details, room configurations, room status matrices.
* `/api/v1/rooms`: Room unit CRUD, live operational status updates, maintenance tags.
* `/api/v1/reservations`: Stay booking, check-in, check-out, room swaps, group blocks.
* `/api/v1/guests`: Guest profiles, CRM history, stay preferences, consent management.
* `/api/v1/rates`: Rate plans, seasonal grids, restriction schedules, yield rules.
* `/api/v1/revenue`: Demand forecast queries, AI rate recommendations, human override submissions.
* `/api/v1/inventory`: Daily availability grids, allotment locks, stop-sell triggers.
* `/api/v1/channels`: Channel partner registry, rate parity health checks, sync queues.
* `/api/v1/marketplace`: Multi-vertical search (Hotels, Flights, Cars, Tours), cart management.
* `/api/v1/bookings`: Universal checkout, booking holds, voucher applications, cancellations.
* `/api/v1/folios`: Guest billing ledgers, charge postings, split bills, payment captures.
* `/api/v1/housekeeping`: Task assignments, cleaner schedules, room inspection approvals.
* `/api/v1/maintenance`: Work order ticketing, room out-of-order blocks, resolution tracking.
* `/api/v1/corporate`: Corporate accounts, travel policy rules, tier approvals, spend controls.
* `/api/v1/expenses`: Receipt uploads, Gemini OCR extraction, expense itemization, reconciliation.
* `/api/v1/concierge`: AI guest assistant chat, service requests, localized guides.
* `/api/v1/loyalty`: Member accounts, points accrual, tier status, rewards catalog.
* `/api/v1/notifications`: Event notification dispatches, channel delivery status, templates.
* `/api/v1/reports`: Operational & revenue dashboards, scheduled export generation.
