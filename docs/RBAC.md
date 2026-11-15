# Nexgile-TravAI: Role-Based Access Control (RBAC) & Scoping

## 1. Identity & Role Architecture
RBAC in Nexgile-TravAI decouples **Users**, **Roles**, **Permissions**, and **Tenant Scopes**. A user may have multiple role assignments across different scopes (e.g., Property Administrator at Property A, but Leisure Traveler globally).

## 2. Scope Hierarchy
1. **Platform Scope**: Super administrator access across all organizations.
2. **Organization Scope**: Enterprise-wide administration across all brands and properties.
3. **Brand Scope**: Management over a cluster of properties within a specific brand.
4. **Property Scope**: Operational access strictly confined to a single physical property.
5. **Corporate Account Scope**: Travel manager, approver, or employee role within a corporate account.
6. **Individual Scope**: Traveler/Guest self-access to personal bookings, itineraries, and documents.

## 3. Standard Roles Matrix
* `PlatformAdmin`: Full systemic governance, integration certifications, global telemetry.
* `ChainAdmin`: Portfolio-wide performance, brand standards, enterprise rate plans.
* `PropertyAdmin`: Complete operational and financial authority over a single property.
* `FrontDesk`: Check-in/out, walk-in creation, room assignments, folio postings, key issuing.
* `RevenueManager`: Demand forecasts, rate strategies, override authorizations, channel allotments.
* `HousekeepingStaff`: Task viewing, room status updates (dirty -> clean), supply counts.
* `HousekeepingSupervisor`: Task dispatch, quality inspections (clean -> inspected).
* `MaintenanceEngineer`: Maintenance ticket intake, out-of-order declarations, repair resolutions.
* `FinanceAuditor`: Folio audit reports, invoice reconciliations, refund reviews, tax compliance.
* `CorporateTravelManager`: Company travel policy configurations, employee tiers, budget allocations.
* `CorporateApprover`: Out-of-policy booking reviews, department trip approvals.
* `CorporateTraveler`: Self-service booking under company policy guidelines, expense logging.
* `LeisureTraveler / Guest`: Marketplace shopping, mobile itinerary, digital keys, loyalty points.

## 4. Fine-Grained Permissions
Permissions follow the `domain:resource:action` format:
* `pms:reservation:view`, `pms:reservation:create`, `pms:reservation:modify`, `pms:reservation:cancel`
* `pms:room:assign`, `pms:room:override_status`
* `billing:folio:view`, `billing:folio:post_charge`, `billing:folio:refund`, `billing:folio:close`
* `revenue:rates:view`, `revenue:rates:recommend`, `revenue:rates:override`, `revenue:rates:publish`
* `distribution:channel:configure`, `distribution:inventory:sync`, `distribution:stop_sell:toggle`
* `ops:task:assign`, `ops:task:complete`, `ops:inspection:signoff`
* `corporate:policy:modify`, `corporate:booking:approve`
* `ai:concierge:interact`, `ai:override:execute`
