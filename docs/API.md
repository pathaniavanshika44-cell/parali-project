# API Contract — Parali-to-CBG Marketplace

## 1. Document Status

This document defines the planned HTTP API contract for the Parali-to-CBG Marketplace.

**Status:** Proposed. These endpoints are specifications for future implementation, not a claim that the endpoints are currently available.

- Base URL during local development: `http://localhost:8000`
- API prefix: `/api/v1`
- Format: JSON over HTTP
- Authentication: short-lived access token, with secure cookie-based session handling through the Next.js backend-for-frontend (BFF)
- Business timezone: `Asia/Kolkata`
- Database timestamps: UTC

FastAPI will generate the OpenAPI specification when the endpoints are implemented.

## 2. Common Conventions

### Request headers

Protected requests will use the authenticated session managed by the web application's server-side route handlers. If a direct API client is supported, it may use:

`Authorization: Bearer <access_token>`

JSON requests should use:

`Content-Type: application/json`

Booking creation should include:

`Idempotency-Key: <unique-client-generated-key>`

The same idempotency key and same request payload must return the previously recorded result rather than create a duplicate booking. Reusing the key with a different payload should return a conflict response.

### Response format

Successful responses should use JSON. List endpoints should use a consistent pagination format.

Example:

```json
{
  "data": [],
  "pagination": {
    "limit": 20,
    "next_cursor": null
  }
}
```

Individual resource endpoints may return the resource directly or inside a `data` object. The implementation should choose one convention and apply it consistently.

### Error format

Use a consistent error response:

```json
{
  "error": {
    "code": "INSUFFICIENT_CAPACITY",
    "message": "The selected plant does not have enough available capacity.",
    "request_id": "example-request-id",
    "details": {}
  }
}
```

The `request_id` is for troubleshooting. Internal stack traces, secrets, OTP values, and sensitive database details must not be exposed.

## 3. Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/auth/otp/request` | Request a login OTP | Public, rate-limited |
| POST | `/api/v1/auth/otp/verify` | Verify OTP and establish a session | Public, rate-limited |
| POST | `/api/v1/auth/refresh` | Refresh the session | Valid refresh session |
| POST | `/api/v1/auth/logout` | Revoke the session | Authenticated |
| GET | `/api/v1/auth/me` | Return the authenticated user | Authenticated |

### Request OTP

Example request:

```json
{
  "phone": "+91XXXXXXXXXX"
}
```

The server must normalize and validate phone numbers, enforce request limits, store OTP verification data securely, and apply an expiry and resend cooldown.

In development only, a fake OTP may be used. It must never be exposed in production responses or logs.

### Verify OTP

Example request:

```json
{
  "phone": "+91XXXXXXXXXX",
  "otp": "123456"
}
```

The server verifies the OTP, checks the account and role, and establishes a session. An untrusted request body must not be allowed to assign administrative roles.

The web application should store session credentials in appropriately configured HTTP-only, Secure-in-production, SameSite cookies. Tokens must not be stored in browser localStorage.

## 4. Farmer Profile

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/farmers/me` | Get the current farmer profile | Farmer |
| PATCH | `/api/v1/farmers/me` | Update permitted profile fields | Farmer |

Example profile fields:

```json
{
  "name": "Example Farmer",
  "village": "Example Village",
  "land_area_acres": "3.50"
}
```

The server must validate numeric values and location data. Farmers must not be able to modify another farmer's profile.

## 5. CBG Plants and Discovery

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/cbgs` | List eligible plants | Authenticated |
| GET | `/api/v1/cbgs/{cbg_id}` | Get plant details | Authenticated |
| GET | `/api/v1/cbgs/recommendations` | Find suitable nearby plants | Farmer |
| GET | `/api/v1/cbgs/{cbg_id}/prices` | Get applicable plant prices | Authenticated |

Recommendation query parameters may include:

- `latitude`
- `longitude`
- `crop_type`
- `quantity_tons`
- `date`

The backend should filter for active and verified plants, consider available capacity and crop-specific prices, and use OSRM road-distance estimates for ranking.

A recommendation may include:

```json
{
  "cbg_id": "example-uuid",
  "distance_km": 24.6,
  "duration_minutes": 48,
  "price_per_ton": "1800.00",
  "available_capacity_tons": "12.00",
  "estimated_gross_value": "9000.00",
  "availability": "AVAILABLE"
}
```

All values are illustrative, not actual plant prices or availability.

Road distance and duration are estimates. If routing fails, the API must indicate that the estimate is unavailable instead of presenting straight-line distance as road distance.

## 6. Bookings

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/bookings` | Request a booking | Farmer |
| GET | `/api/v1/bookings` | List the current user's bookings | Authenticated |
| GET | `/api/v1/bookings/{booking_id}` | Get booking details | Authorized owner or operator |
| POST | `/api/v1/bookings/{booking_id}/cancel` | Request cancellation | Authorized farmer, subject to rules |
| POST | `/api/v1/bookings/{booking_id}/complete` | Record delivery completion | Authorized plant operator |

### Create booking

Example request:

```json
{
  "cbg_id": "example-uuid",
  "crop_type": "paddy_straw",
  "quantity_tons": "2.50",
  "pickup_location": {
    "latitude": 28.7000,
    "longitude": 77.8000
  },
  "pickup_address": "Example Village",
  "preferred_date": "2026-10-18"
}
```

The server must derive the farmer identity from the authenticated session. It must not trust a `farmer_id` supplied by the client.

Quantity and money-related values should use validated decimal representations to avoid floating-point precision errors.

The server must validate the crop, quantity, pickup location, preferred date, farmer limits, plant eligibility, price, booking cutoff, and capacity.

### Booking creation behavior

Booking creation must reserve capacity atomically within a database transaction.

- If sufficient capacity is available, reserve it and create an accepted booking.
- If capacity is insufficient, decline the request or apply the configured waitlist policy.
- If reservation or booking persistence fails, roll back the transaction.
- Record the initial booking event.
- Store the locked price when the booking is accepted.
- Support idempotent retries through `Idempotency-Key`.

An accepted booking must never exist without its corresponding capacity reservation.

### Booking response

```json
{
  "booking_id": "example-uuid",
  "booking_code": "EXAMPLE-CODE",
  "status": "ACCEPTED",
  "quantity_tons": "2.50",
  "locked_price_per_ton": "1800.00",
  "preferred_date": "2026-10-18",
  "delivery_deadline": "19:00",
  "reason_code": null
}
```

All identifiers, prices, and booking details above are examples only.

## 7. CBG Operator Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/operator/bookings` | View bookings for the operator's plant | CBG operator |
| PATCH | `/api/v1/operator/capacity/{capacity_id}` | Update permitted daily capacity values | Authorized operator |
| POST | `/api/v1/operator/bookings/{booking_id}/complete` | Verify delivery and record actual weight | Authorized operator |

Operators must only access plants to which they are assigned.

Completion requests should include the actual accepted weight and any required delivery verification details. The server must validate weight discrepancies and calculate the final amount using the locked price and permitted deductions.

Capacity reductions must not silently invalidate existing reservations. The system must apply an explicit, audited policy.

## 8. Transport

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/transport/requests` | Request transportation | Authorized farmer |
| GET | `/api/v1/transport/requests` | List permitted transport requests | Authorized user |
| GET | `/api/v1/transport/requests/{request_id}` | View a transport request | Authorized participant |
| POST | `/api/v1/transport/requests/{request_id}/accept` | Claim or accept an available request | Verified transporter |
| POST | `/api/v1/transport/requests/{request_id}/cancel` | Cancel when permitted | Authorized participant |

Transport assignment must validate vehicle capacity, transporter verification, request status, and any deadline constraints. Competing transporter claims must be resolved atomically.

## 9. Administration

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/admin/cbgs` | Review plant records | Admin |
| PATCH | `/api/v1/admin/cbgs/{cbg_id}/verification` | Verify or reject a plant | Admin |
| PUT | `/api/v1/admin/cbgs/{cbg_id}/prices` | Configure plant prices | Admin or explicitly authorized role |
| GET | `/api/v1/admin/audit-logs` | Review permitted audit records | Admin |

Administrative actions must be authorized, validated, and audited. Price changes and capacity overrides must preserve historical records where required.

## 10. Health and Operational Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/health` | Basic service health | Public or infrastructure |
| GET | `/ready` | Readiness of required dependencies | Infrastructure |

Health responses must not reveal database credentials, secrets, internal connection strings, or sensitive infrastructure details.

## 11. HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created |
| `202 Accepted` | Request accepted for asynchronous processing |
| `400 Bad Request` | Malformed or invalid request |
| `401 Unauthorized` | Missing or invalid authentication |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Resource not found or intentionally concealed |
| `409 Conflict` | Capacity conflict, invalid state transition, or idempotency conflict |
| `422 Unprocessable Entity` | Request fails semantic validation |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server failure |
| `503 Service Unavailable` | Required service temporarily unavailable |

A capacity failure may use `409 Conflict` with a stable error code such as `INSUFFICIENT_CAPACITY`. Exact status-code choices should be consistent across implementation and tests.

## 12. Security Requirements

- Validate every request using Pydantic schemas.
- Enforce role-based and object-level authorization on every protected resource.
- Never trust client-supplied identity or role values.
- Rate-limit OTP and other abuse-prone endpoints.
- Reject expired, malformed, or incorrectly signed tokens.
- Use parameterized database operations.
- Apply appropriate CORS and cookie policies.
- Avoid logging OTPs, tokens, passwords, or other secrets.
- Use request IDs and structured logs for troubleshooting.
- Audit sensitive administrative actions and booking transitions.

## 13. API Testing Requirements

Before an endpoint is considered complete, tests should verify:

1. Valid requests and response schemas.
2. Invalid fields, boundary values, and malformed input.
3. Authentication and authorization.
4. Cross-user and cross-plant access attempts.
5. Database transaction behavior on failures.
6. Idempotent retry behavior.
7. Capacity correctness under concurrent booking requests.
8. Timezone and cutoff boundary behavior.
9. Appropriate status codes and stable error codes.

The API contract must be updated whenever the implementation changes. A documented endpoint is not considered implemented until its code and tests demonstrate the expected behavior.