# Nexgile-TravAI: Database Design Strategy

## 1. Database Architecture Principles
Nexgile-TravAI selects **PostgreSQL** as the primary relational system of record for transactional fidelity, strict foreign key constraints, composite index optimization, and ACID compliance across booking folios and inventory allotments.

## 2. Multi-Tenant Partitioning Model
* **Logical Isolation**: Every core table includes `organization_id` (and where applicable, `property_id` or `corporate_account_id`).
* **Row-Level Security (RLS)**: Database-level tenancy filters verify `current_setting('app.current_tenant_id')` to enforce data isolation at the engine level.
* **Composite Primary & Foreign Keys**: High-volume operational tables use composite indexing `(organization_id, property_id, id)` to guarantee rapid queries and partition pruning.

## 3. Schema Modules

```sql
-- Core Organizational Hierarchy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    timezone VARCHAR(64) DEFAULT 'UTC',
    base_currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_org_property_code UNIQUE(organization_id, code)
);

CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    base_occupancy INT NOT NULL DEFAULT 2,
    max_occupancy INT NOT NULL DEFAULT 4,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    room_number VARCHAR(32) NOT NULL,
    floor VARCHAR(16),
    housekeeping_status VARCHAR(32) DEFAULT 'clean', -- clean, dirty, inspected, out_of_order
    operational_status VARCHAR(32) DEFAULT 'available', -- available, occupied, reserved, maintenance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_property_room_number UNIQUE(property_id, room_number)
);

-- Inventory & Availability Engine
CREATE TABLE inventory_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    date DATE NOT NULL,
    total_rooms INT NOT NULL,
    allocated_rooms INT NOT NULL DEFAULT 0,
    booked_rooms INT NOT NULL DEFAULT 0,
    stop_sell BOOLEAN NOT NULL DEFAULT FALSE,
    version INT NOT NULL DEFAULT 0, -- Optimistic locking
    CONSTRAINT uq_inventory_day UNIQUE(property_id, room_type_id, date)
);

-- Reservations, Bookings & Folios
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    booking_reference VARCHAR(32) UNIQUE NOT NULL,
    channel_id UUID,
    corporate_account_id UUID,
    primary_guest_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed', -- tentative, confirmed, cancelled, completed
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    assigned_room_id UUID REFERENCES rooms(id),
    guest_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'booked', -- booked, checked_in, checked_out, no_show, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE folios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID NOT NULL REFERENCES stays(id),
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- open, closed, split, disputed
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE folio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_id UUID NOT NULL REFERENCES folios(id),
    type VARCHAR(32) NOT NULL, -- room_charge, tax, restaurant, payment, adjustment, refund
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    posted_by UUID NOT NULL,
    posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Pricing Recommendations & Overrides
CREATE TABLE dynamic_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    target_date DATE NOT NULL,
    base_rate NUMERIC(10, 2) NOT NULL,
    ai_recommended_rate NUMERIC(10, 2),
    confidence_score NUMERIC(4, 3),
    ai_rationale TEXT,
    applied_rate NUMERIC(10, 2) NOT NULL,
    is_overridden BOOLEAN NOT NULL DEFAULT FALSE,
    overridden_by UUID,
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Concurrency & Integrity Controls
* **Optimistic Locking**: Handled via `version` counters in `inventory_days` and `rate_plans`. Concurrent booking requests check `WHERE version = :current_version`.
* **Idempotency Safeguard**: Unique constraint on `bookings.idempotency_key` guarantees zero double-bookings from duplicate network retries.
* **Audit Tracing**: Read-only `audit_logs` record all mutations with actor UUID, IP address, timestamp, pre-image, and post-image JSON.
