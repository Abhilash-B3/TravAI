# Nexgile-TravAI: Core Domain Model & Vocabulary

## 1. Domain Entities & Taxonomy

### Organizational Hierarchy
* **Organization**: The top-level tenant entity (e.g., hotel management company, enterprise operator, global travel group).
* **Brand / Chain**: Brand umbrella within an organization (e.g., Luxury Collection, Express Suites).
* **Property**: Physical property operating within a brand (e.g., Grand Palace Hotel Tokyo).
* **CorporateAccount**: Enterprise client organization with contracted travel policies, billing terms, and traveler groups.

### Physical & Inventory Assets
* **RoomType**: Physical category definition (e.g., Deluxe King, Ocean Suite) with base capacity and amenities.
* **Room**: Physical unit entity with physical location, current housekeeping condition, and operational availability status.
* **RatePlan**: Pricing policy framework (e.g., Non-Refundable, Bed & Breakfast, Flexible Corporate) with cancellation rules.
* **Amenity**: Standardized catalog of facility features (e.g., High-speed WiFi, EV charging, pool).
* **Inventory**: Daily bookable units for a given RoomType on a given date under a given RatePlan.
* **Allotment**: Quotas pre-allocated to specific channels, corporate contracts, or tour operators.
* **Restriction**: Daily yield constraints (Min Length of Stay [MLOS], Max Length of Stay, Close to Arrival [CTA], Close to Departure [CTD], Stop-Sell).

### Customer & Identity
* **Guest**: Individual residing at a property with stay histories, room preferences, and dietary restrictions.
* **Traveler**: User profile capable of searching, holding, and booking travel inventory across marketplace verticals.
* **Profile**: Core identity entity uniting contact details, localized language/currency preferences, and verified status.
* **Preference**: Explicit (chosen) and implicit (AI-inferred) traveler affinities and requirements.
* **Consent**: Privacy consent audit log (GDPR/CCPA/marketing preferences) with timestamp and IP.
* **LoyaltyAccount**: Tier status, points balance, transaction history, and redemption ledger.

### Transactions, Bookings & Billing
* **Search**: Session query capturing destination, geo-coordinates, dates, passenger counts, filters.
* **Cart**: Transient container holding inventory reservations pending final confirmation.
* **Booking**: Commercial agreement covering one or more travel items (Hotel, Flight, Rental, Tour).
* **PNR**: Passenger Name Record identifier across global distribution systems.
* **Stay**: Property-specific stay record binding a Guest to a specific Room and RoomType over check-in/out dates.
* **Folio**: Master guest financial ledger capturing debits (room charges, minibar, spa) and credits (payments, vouchers).
* **Payment**: Financial transaction record with gateway reference, idempotency key, payment method, currency, status.
* **Refund**: Reversal transaction bound to an original payment with approval audit trail.
* **Voucher**: Digital entitlement token representing credit, gift balance, or partner discount.
* **Invoice**: Legal, audit-ready billing document generated for guests or corporate accounts.

### Distribution & Integration
* **Channel**: External distributor endpoint (e.g., Booking.com, Expedia, Amadeus, Corporate Portal).
* **Supplier**: Inventory source entity supplying products to the marketplace (e.g., Hotel Supplier, Airline GDS).
* **Product**: Normalized marketplace listing (hotel room, flight route, car category, tour pass).
* **Mapping**: Cross-reference map connecting internal RoomTypes/RatePlans to third-party OTA product IDs.
* **SyncEvent**: Audit record of rate/inventory push or reservation pull operations across channels.

### Operations & Experience
* **Task**: Unit of work assigned to staff (e.g., Housekeeping cleaning, Turn-down, Inspection).
* **ServiceRequest**: Guest-initiated ticket (e.g., extra pillows, luggage assistance, maintenance).
* **MaintenanceCase**: Technical incident ticket tracking out-of-order room status and resolution.
* **Review**: Guest sentiment submission with numeric scoring, written commentary, and property management reply.
* **Offer**: Dynamic upsell proposal (e.g., suite upgrade, late check-out, airport transfer).
* **Itinerary**: Multi-segment chronological travel schedule combining stays, flights, and activities.
