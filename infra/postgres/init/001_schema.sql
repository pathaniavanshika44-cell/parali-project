
-- Parali-to-CBG Marketplace
-- Phase 0: Initial database schema

CREATE EXTENSION IF NOT EXISTS postgis;

-- Application roles
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM (
        'FARMER', 'CBG_OPERATOR', 'TRANSPORTER', 'ADMIN'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Crop types
DO $$ BEGIN
    CREATE TYPE crop_type AS ENUM (
        'PADDY_STRAW', 'WHEAT_STRAW', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Booking lifecycle
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'REQUESTED', 'ACCEPTED', 'DECLINED',
        'WAITLISTED', 'COMPLETED', 'CANCELLED',
        'NO_SHOW', 'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transport lifecycle
DO $$ BEGIN
    CREATE TYPE transport_status AS ENUM (
        'OPEN', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT',
        'COMPLETED', 'CANCELLED', 'EXPIRED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. All registered users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    role app_role NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Farmer-specific information
CREATE TABLE IF NOT EXISTS farmers (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    village VARCHAR(120),
    land_area_acres NUMERIC(10, 2)
        CHECK (land_area_acres IS NULL OR land_area_acres >= 0),
    pickup_address TEXT,
    pickup_location GEOGRAPHY(POINT, 4326),
    strikes INTEGER NOT NULL DEFAULT 0 CHECK (strikes >= 0),
    suspended_until TIMESTAMPTZ
);

-- 3. CBG plants
CREATE TABLE IF NOT EXISTS cbgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Operators authorized to manage a plant
CREATE TABLE IF NOT EXISTS cbg_operators (
    cbg_id UUID NOT NULL REFERENCES cbgs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    PRIMARY KEY (cbg_id, user_id)
);

-- 5. Daily plant capacity
CREATE TABLE IF NOT EXISTS cbg_daily_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cbg_id UUID NOT NULL REFERENCES cbgs(id),
    capacity_date DATE NOT NULL,
    storage_max_tons NUMERIC(12, 3) NOT NULL
        CHECK (storage_max_tons >= 0),
    current_stock_tons NUMERIC(12, 3) NOT NULL DEFAULT 0
        CHECK (current_stock_tons >= 0),
    daily_consumption_tons NUMERIC(12, 3) NOT NULL DEFAULT 0
        CHECK (daily_consumption_tons >= 0),
    buffer_target_tons NUMERIC(12, 3) NOT NULL DEFAULT 0
        CHECK (buffer_target_tons >= 0),
    reserved_today_tons NUMERIC(12, 3) NOT NULL DEFAULT 0
        CHECK (reserved_today_tons >= 0),
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cbg_id, capacity_date),
    CHECK (current_stock_tons <= storage_max_tons),
    CHECK (buffer_target_tons <= storage_max_tons)
);

-- 6. Plant prices and price history
CREATE TABLE IF NOT EXISTS cbg_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cbg_id UUID NOT NULL REFERENCES cbgs(id),
    crop crop_type NOT NULL,
    price_per_ton NUMERIC(12, 2) NOT NULL
        CHECK (price_per_ton >= 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    set_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cbg_prices_current
ON cbg_prices (cbg_id, crop)
WHERE effective_to IS NULL;

-- 7. Farmer bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(32) UNIQUE,
    farmer_id UUID NOT NULL REFERENCES farmers(user_id),
    cbg_id UUID NOT NULL REFERENCES cbgs(id),
    crop crop_type NOT NULL,
    quantity_tons NUMERIC(12, 3) NOT NULL
        CHECK (quantity_tons > 0),
    pickup_address TEXT,
    pickup_location GEOGRAPHY(POINT, 4326),
    preferred_date DATE NOT NULL,
    status booking_status NOT NULL DEFAULT 'REQUESTED',
    reason_code VARCHAR(60),
    reserved_tons NUMERIC(12, 3) NOT NULL DEFAULT 0
        CHECK (reserved_tons >= 0),
    locked_price_per_ton NUMERIC(12, 2)
        CHECK (locked_price_per_ton IS NULL OR locked_price_per_ton >= 0),
    actual_weight_tons NUMERIC(12, 3)
        CHECK (actual_weight_tons IS NULL OR actual_weight_tons >= 0),
    total_amount NUMERIC(14, 2)
        CHECK (total_amount IS NULL OR total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate active bookings for the same farmer and date.
CREATE UNIQUE INDEX IF NOT EXISTS uq_farmer_active_booking_day
ON bookings (farmer_id, preferred_date)
WHERE status IN ('REQUESTED', 'ACCEPTED', 'WAITLISTED');

CREATE INDEX IF NOT EXISTS idx_bookings_cbg_date_status
ON bookings (cbg_id, preferred_date, status);

CREATE INDEX IF NOT EXISTS idx_bookings_farmer_created
ON bookings (farmer_id, created_at DESC);

-- 8. History of booking status changes
CREATE TABLE IF NOT EXISTS booking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    from_status booking_status,
    to_status booking_status NOT NULL,
    actor_user_id UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking
ON booking_events (booking_id, created_at);

-- 9. Idempotency keys: protect against repeated booking submissions
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    idempotency_key VARCHAR(128) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, idempotency_key)
);

-- 10. OTP requests: store hashes, never plaintext OTPs
CREATE TABLE IF NOT EXISTS otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code_hash TEXT NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'LOGIN',
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    expires_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consumed_at TIMESTAMPTZ,
    request_ip INET
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_sent
ON otp_requests (phone, sent_at DESC);

-- 11. Refresh tokens: store token hashes
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by UUID REFERENCES refresh_tokens(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Notifications and retry tracking
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel VARCHAR(20) NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Transporters
CREATE TABLE IF NOT EXISTS transporters (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- 14. Transport vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES transporters(user_id),
    vehicle_class VARCHAR(40) NOT NULL
        CHECK (vehicle_class IN ('TRACTOR_TROLLEY', 'TEMPO', 'TRUCK')),
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    capacity_tons NUMERIC(12, 3) NOT NULL CHECK (capacity_tons > 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- 15. Transport requests
CREATE TABLE IF NOT EXISTS transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    farmer_id UUID NOT NULL REFERENCES farmers(user_id),
    vehicle_id UUID REFERENCES vehicles(id),
    transporter_id UUID REFERENCES transporters(user_id),
    status transport_status NOT NULL DEFAULT 'OPEN',
    quoted_price NUMERIC(12, 2)
        CHECK (quoted_price IS NULL OR quoted_price >= 0),
    distance_km NUMERIC(10, 2)
        CHECK (distance_km IS NULL OR distance_km >= 0),
    pickup_otp_hash TEXT,
    dropoff_otp_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transport_open_status
ON transport_requests (status, created_at);

-- 16. Financial ledger: records amounts, not real money transfers
CREATE TABLE IF NOT EXISTS payments_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    entry_type VARCHAR(10) NOT NULL
        CHECK (entry_type IN ('CREDIT', 'DEBIT')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    reason TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit log for important actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    request_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_logs (entity_type, entity_id, created_at DESC);

-- 18. Application configuration
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(120) PRIMARY KEY,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Geographic indexes for nearby searches
CREATE INDEX IF NOT EXISTS idx_cbgs_location
ON cbgs USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_farmers_pickup_location
ON farmers USING GIST (pickup_location);

CREATE INDEX IF NOT EXISTS idx_bookings_pickup_location
ON bookings USING GIST (pickup_location);

-- Safe default configuration values
INSERT INTO system_config (config_key, config_value, description)
VALUES
    ('booking_cutoff_time', '"15:00"'::JSONB, 'Daily booking cutoff in Asia/Kolkata'),
    ('delivery_deadline', '"19:00"'::JSONB, 'Daily delivery deadline in Asia/Kolkata'),
    ('default_truck_capacity_tons', '10'::JSONB, 'Default farmer daily quantity cap'),
    ('default_tons_per_acre', '1'::JSONB, 'Configurable estimate of straw tons per acre')
ON CONFLICT (config_key) DO NOTHING;
