# Project Assumptions — Parali-to-CBG Marketplace

**Status:** Phase 0 — Initial assumptions
**Project timezone:** Asia/Kolkata (IST)
**Purpose:** Record the initial business rules, system constraints, and decisions that guide development.

## 1. Project Overview

The Parali-to-CBG Marketplace connects farmers who want to sell agricultural straw with Compressed Biogas (CBG) plants that need feedstock.

The platform will help farmers find suitable plants, compare prices and road distances, book delivery slots, and track their bookings. CBG operators will manage plant capacity, prices, and delivery completion. Transporters will be able to accept eligible transport requests.

## 2. User Roles

The application will support four roles:

- **FARMER:** Manage a profile, enter straw details, find suitable CBG plants, and create and track bookings.
- **CBG_OPERATOR:** Manage an assigned plant's capacity and prices, view bookings, verify deliveries, and record actual delivered weight.
- **TRANSPORTER:** Manage vehicles and handle eligible transport requests.
- **ADMIN:** Verify plants and transporters, manage system settings, review exceptional cases, and access audit records.

Users must only access resources permitted for their role and ownership.

## 3. Authentication and Security

1. Users will sign in using their phone number and OTP.
2. OTPs will expire after five minutes and allow a maximum of three verification attempts per issued OTP.
3. OTP resend requests will be subject to a cooldown and rate limits.
4. Development-only fake OTPs may be returned or logged only when the application environment is explicitly set to development.
5. Production OTPs must not be exposed in API responses or logs.
6. Access tokens will be short-lived JWTs, and refresh tokens will rotate when used.
7. Authentication tokens will be stored in secure, HTTP-only cookies through the frontend's backend-for-frontend (BFF) routes.
8. The frontend must not store authentication tokens in localStorage.
9. User identity and role must be derived from validated authentication credentials, not trusted from request-body fields.
10. Passwords are not required for the initial phone-and-OTP login flow. OTPs and refresh tokens must be stored securely.
11. No Aadhaar number or other unnecessary sensitive identity information will be collected.

## 4. Farmer Profiles and Straw Requests

1. A farmer profile will include a name, village or address, and land area in acres.
2. A farmer may provide a pickup location using a map pin, GPS, or a typed address.
3. A straw request will record the crop type, quantity in metric tonnes, pickup location, and requested delivery date.
4. Supported initial crop categories will be paddy straw, wheat straw, and other.
5. The initial booking flow will support same-day delivery only.
6. The default daily quantity limit will be:

   `min(truck_capacity_tons, land_area_acres × tons_per_acre × 1.2)`

   The values for truck capacity and tonnes per acre must be configurable. The factor `1.2` is an initial business assumption and may be adjusted after validation.

7. Quantity must be greater than zero and use controlled decimal precision.
8. Requests exceeding the configured hard limit will be rejected with a clear explanation. Where appropriate, the farmer may book the remaining eligible quantity or try again on a later day.
9. Unusual quantities may be flagged for review without being automatically rejected unless they violate a hard limit.

## 5. CBG Plant Data and Verification

1. The initial seed dataset contains nine CBG stations, identified as Pid01 through Pid09, supplied for this project.
2. The supplied plant names, addresses, district names, coordinates, and feedstock capacities are stored as initial reference data.
3. Database storage and coordinate readback have been tested, but the real-world accuracy of the plant locations has not been independently confirmed.
4. Seeded plants will initially have `is_verified = false`.
5. A plant must be verified by an authorized administrator before farmers can make bookings with it.
6. A plant's supplied feedstock capacity in tonnes per day is not the same as its currently available booking capacity.
7. Plant availability will depend on configured stock, consumption, buffer, reservations, and closure status.
8. Plant pricing and daily operational capacity have not yet been supplied for the initial dataset. A plant must have valid pricing and configured availability before it can be offered as bookable.
9. Inactive, unverified, closed, or full plants must not be presented as available for booking.

## 6. Capacity and Overbooking Prevention

Each plant's daily operational capacity will be calculated from its current operational data.

- **Required feedstock:** `daily_consumption + buffer_target - current_stock`
- **Remaining storage space:** `storage_max - current_stock - reserved_today`
- **Available booking capacity:** the maximum of zero and the smaller of the required feedstock after reservations and remaining storage space.

The implementation must ensure that all calculated capacity values remain non-negative.

1. Operators may update storage limits, current stock, daily consumption, buffer targets, and closure status.
2. Buffer targets must not exceed storage capacity.
3. Capacity must be reserved atomically inside a database transaction. The application must not rely on a separate read-then-write check.
4. A booking must not be accepted if its reservation would exceed available capacity.
5. Booking creation and capacity reservation must succeed or fail together within a transaction.
6. Cancellation, expiry, or an eligible booking adjustment must release reserved capacity exactly once.
7. Concurrent booking requests must never cause capacity to be exceeded.
8. Operators who reduce capacity or close a plant must not silently invalidate existing reservations. Such changes require explicit handling and an audit record.

## 7. Plant Recommendations and Routes

1. The platform will recommend up to five suitable CBG plants, ranked by road distance when routing data is available.
2. PostGIS will be used to filter nearby plants geographically.
3. OSRM will provide road-distance and travel-duration estimates.
4. Cached routing results may be reused for rounded coordinates.
5. Recommendation results should include estimated distance, travel duration, applicable price, available capacity, availability status, and estimated gross earnings.
6. Estimated gross earnings will be calculated as requested eligible quantity multiplied by the displayed price per tonne. They are not a guarantee of final payment.
7. Full or unavailable plants will be excluded from bookable recommendations. The system should consider the next-nearest eligible plants to return up to five results when enough are available.
8. If routing services fail, the application must handle the failure gracefully and must not present straight-line distance as road distance.
9. If fewer than five eligible plants exist, the system will return the available eligible results rather than inventing alternatives.

## 8. Booking Window and Delivery Deadline

1. The default daily booking cutoff is **3:00 PM IST**.
2. The default delivery deadline for accepted bookings is **7:00 PM IST** on the same day.
3. All business rules involving dates and times use the `Asia/Kolkata` timezone.
4. Timestamps will be stored in UTC in the database and converted to IST for user-facing displays and business-rule evaluation.
5. Requests submitted after the booking cutoff will not be accepted for same-day delivery.
6. The exact boundary is strict: a request at or after 3:00 PM IST is late; an undelivered accepted booking at or after 7:00 PM IST becomes eligible for expiry processing.
7. A scheduled background job will expire eligible undelivered bookings and release their reservations.
8. Expiry processing must be idempotent, meaning running it more than once must not release capacity more than once.
9. A farmer with an expired booking may create a new request on a subsequent eligible day.

## 9. Booking Decisions and Status Transitions

The initial booking states will be:

- `REQUESTED`
- `ACCEPTED`
- `DECLINED`
- `WAITLISTED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

The allowed transitions will be enforced by backend business logic.

- `REQUESTED` → `ACCEPTED`, `DECLINED`, or `WAITLISTED`
- `WAITLISTED` → `ACCEPTED` or `EXPIRED`
- `ACCEPTED` → `COMPLETED`, `CANCELLED`, or `NO_SHOW`

The `EXPIRED` status is a planned business state and must be included consistently in the database status definition and backend implementation before this transition is enabled.

1. An accepted booking must reserve capacity.
2. A declined booking must include a machine-readable reason and a user-friendly explanation.
3. Waitlisting is permitted only when the plant has enabled it.
4. Invalid state transitions must return an appropriate conflict response.
5. Every status transition must create a booking event recording the actor, previous state, new state, reason, and timestamp.
6. Farmers may cancel their bookings only under the configured cancellation rules and cutoff.
7. A farmer may have at most one active booking for a plant-independent farmer/day rule as defined by the business policy. The initial database index will be reviewed to ensure it matches this intended rule.
8. An `Idempotency-Key` will be required or supported for booking creation so retries do not create duplicate bookings.

## 10. Pricing and Payment Records

1. Each plant may have crop-specific prices per metric tonne.
2. Price changes must be recorded with their effective time and the user who made the change.
3. The current applicable price must be validated against configurable minimum and maximum values.
4. A price change exceeding 25% will require explicit confirmation and administrator review.
5. Once a booking is accepted, its price per tonne will be locked as a booking snapshot.
6. Final payable value will be calculated from actual accepted delivered weight and the locked price, less any explicitly recorded deductions.
7. Deductions must include a reason.
8. The first version will record payment and settlement information in a ledger and generate PDF receipts; it will not process real money transfers.
9. No initial plant prices have been provided, so actual prices must be configured before pricing-based recommendations or bookings can be enabled.

## 11. Delivery Verification and Weight

1. A farmer will present a booking code or QR code for delivery verification.
2. An authorized operator will record the actual weighbridge weight.
3. Completion will record the actual delivered quantity and applicable price snapshot.
4. A configurable default weight discrepancy tolerance of ±10% is proposed.
5. Deliveries outside the tolerance require operator review or approval according to the final policy.
6. Partial deliveries and moisture-related deductions must be handled explicitly rather than silently changing the booked quantity.
7. A booking must not be completed by an unauthorized operator or by an operator assigned to another plant.

## 12. Transport Module

1. Transporters will be able to register eligible vehicle types, including tractor-trolleys, tempos, and trucks.
2. Only verified and eligible transporters and vehicles may receive valid transport assignments.
3. The platform will match transport requests against vehicle availability, capacity, and proximity.
4. Transport offers may be broadcast to a limited number of nearby vehicles and expanded after a configured timeout.
5. A transport request must be claimed atomically so two transporters cannot claim the same request.
6. Transport charges will use configurable rates per kilometre and vehicle class, with a configurable maximum charge.
7. Pickup and drop-off may use OTP verification.
8. ETA estimates must be compared with the delivery deadline where relevant.
9. Real-time tracking is a later enhancement and will not be assumed available in the initial implementation.

## 13. Fairness, No-Shows, and Exceptions

1. The default allocation policy is first-come, first-served using successful atomic capacity reservation.
2. Batch allocation, proportional allocation, or lottery-based allocation is a possible future policy and must be explicitly selected before implementation.
3. A proposed rule is to temporarily suspend a farmer after three no-shows within 30 days, subject to administrator override.
4. This suspension rule must be configurable and should not be enabled until its operational and appeal process is defined.
5. Waitlist promotion, cancellations, expiry, and operator overrides must be race-safe and auditable.
6. Notifications may be retried without duplicating bookings or changing booking outcomes.

## 14. Technical and Operational Assumptions

1. The backend will use Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 async, asyncpg, Alembic, and PostgreSQL with PostGIS.
2. Decimal types will be used for monetary values and quantities where exact decimal arithmetic is required.
3. Redis will support rate limiting, background jobs, and eligible caching.
4. The frontend will use Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.
5. The user interface will support English, Hindi, and Punjabi.
6. Maps will use Leaflet, and route estimates will use an OSRM service configured through environment variables.
7. The application will include structured JSON logging, request IDs, health checks, and audit logs.
8. Configuration and secrets will be supplied through environment variables; real secrets must not be committed to Git.
9. Docker Compose will provide the local development services.
10. Database schema changes will be delivered through migrations, and seed scripts must be safe to rerun.
11. Background tasks must be safe to retry and use the `Asia/Kolkata` business timezone.
12. The production OSRM deployment and public routing-service usage limits must be evaluated before production release.

## 15. Testing and Acceptance Criteria

The implementation must include:

- Unit tests for validation, calculations, authorization, and state transitions.
- Integration tests against a real PostgreSQL/PostGIS database.
- A concurrency test sending 200 parallel booking attempts against a plant with 50 tonnes of available capacity, using suitable booking quantities. The test must prove that total reservations never exceed 50 tonnes and that duplicate active bookings are not created.
- Tests for idempotency, cancellation, expiry, waitlist promotion, and transaction failures.
- Security tests for OTP abuse, invalid tokens, role escalation, and unauthorized access to another user's or plant's records.
- Frontend end-to-end tests for farmer booking, operator delivery completion, and booking expiry.
- Load testing using k6 or Locust, with measured results recorded rather than assumed.

No test will be described as passing unless it has actually been run and its result recorded.

## 16. Initial Data and Known Limitations

1. Nine CBG stations have been inserted from the supplied source dataset.
2. Their stored coordinates have been checked against the supplied coordinate values, but independent real-world location verification remains outstanding.
3. All seeded plants are initially unverified.
4. Plant prices and daily operational capacity are not yet configured.
5. OSRM road distances, actual plant operations, delivery completion, and live notifications have not yet been tested.
6. The initial SQL schema and seed data are setup artifacts; they do not yet constitute a complete working application.
7. Business assumptions may be revised when requirements are confirmed. Changes affecting booking, capacity, pricing, or security must be documented and tested.

## 17. Decisions Requiring Confirmation

The following items must be confirmed before the relevant features are finalized:

- Whether the daily farmer booking cap is global across all plants or applies separately to each plant.
- Whether a farmer can have only one active booking per day across all plants, or one per plant per day.
- Whether waitlisting is enabled by default for each plant.
- The final policy for cancellations, late arrivals, partial deliveries, and weight discrepancies.
- The source and approval process for plant prices and daily operational capacity.
- Whether the initial deployment is limited to the supplied Uttar Pradesh plants or will cover a wider region.
- Whether the proposed three-no-show suspension rule will be enabled.
- The final notification channels and OTP delivery provider.

---

**Implementation principle:** Security, capacity correctness, and reliable booking state transitions take priority over convenience features. Any business rule that can affect reservations, payments, or access control must be validated by the backend and enforced at the database or transaction level where appropriate.