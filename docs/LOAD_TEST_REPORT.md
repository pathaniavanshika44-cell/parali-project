# Load Test Report — Parali-to-CBG Marketplace

## 1. Report Status

**Status:** Planned — load tests have not yet been executed.

This document records the load-testing strategy and the results that must be collected when the relevant application endpoints and test infrastructure are implemented.

No performance results or pass claims are reported in this template.

## 2. Objectives

The load tests will evaluate whether the marketplace can:

- Process concurrent booking requests without exceeding plant capacity.
- Prevent duplicate active bookings for the same farmer and day.
- Handle retries safely using idempotency keys.
- Maintain database consistency when transactions fail.
- Respond reliably under expected and elevated traffic.
- Recover correctly from temporary dependency failures.

## 3. Test Environment

Record the actual environment used for each test.

| Item | Planned configuration | Actual value |
|---|---|---|
| Operating system | Record when tested | Pending |
| CPU and memory | Record allocated resources | Pending |
| Python version | Python 3.12 | Pending |
| PostgreSQL | PostgreSQL 16 with PostGIS | Pending |
| Redis | Redis 7 | Pending |
| API server workers | Record actual configuration | Pending |
| Load-testing tool | k6 or Locust | Pending |
| Test database | Dedicated test database | Pending |
| Application version / commit | Record tested revision | Pending |

Test results must include the environment details because performance depends on hardware, database configuration, application settings, and network conditions.

## 4. Critical Concurrent Booking Test

### Scenario

Send 200 concurrent booking requests to a plant with exactly 50 tons of available capacity. Each request attempts to reserve 1 ton.

### Expected results

1. No more than 50 tons are reserved.
2. Total successful reservations do not exceed 50.
3. No duplicate active booking exists for the same farmer and date.
4. Every accepted booking has a corresponding capacity reservation.
5. Rejected requests do not consume capacity.
6. Failed transactions do not leave partial bookings or incorrect reservations.
7. Repeating a request with the same idempotency key does not create a duplicate booking.

The exact number of accepted requests may differ if the test setup includes additional eligibility rules. The capacity invariant must always hold.

### Required assertions

- `reserved_today_tons` never exceeds the permitted capacity.
- The sum of active booking reservations matches the capacity ledger under the implemented reservation model.
- No negative capacity or reservation values are recorded.
- All booking statuses and booking events are consistent.
- Database constraints remain valid after all requests finish.

**Database requirement:** Run this test against real PostgreSQL, not an in-memory substitute or mocked repository.

## 5. Additional Test Scenarios

| Test | Scenario | Expected outcome |
|---|---|---|
| Capacity boundary | Request exactly the remaining capacity | Accepted if all other rules pass |
| Capacity overflow | Request more than the remaining capacity | Declined or waitlisted according to policy |
| Mixed quantities | Concurrent requests with different quantities | Total reservations remain within capacity |
| Duplicate submission | Send the same idempotency key repeatedly | One logical booking result |
| Farmer uniqueness | Submit competing bookings for one farmer and date | At most one active booking |
| Cancellation | Cancel an eligible accepted booking | Reservation released exactly once |
| Expiry retry | Run the expiry job more than once | No duplicate release or state corruption |
| Cutoff boundary | Submit immediately before and at the cutoff | Consistent configured timezone policy |
| Database failure | Interrupt a booking transaction | No partial reservation |
| Redis unavailable | Simulate Redis failure | Behavior follows the documented dependency policy |
| Routing unavailable | Simulate OSRM failure | Graceful error or documented fallback |
| Unauthorized access | Attempt cross-user or cross-plant operations | Access denied |

## 6. Load Profile

Once the API and test environment are available, run controlled load levels.

| Profile | Planned workload | Purpose |
|---|---|---|
| Smoke test | A few requests | Confirm the test setup works |
| Baseline | 10 concurrent virtual users | Establish initial latency |
| Moderate load | 50 concurrent virtual users | Identify early bottlenecks |
| Elevated load | 100 concurrent virtual users | Measure behavior under increased traffic |
| Booking stress test | 200 concurrent booking requests | Validate capacity invariants |
| Sustained load | A documented duration and arrival rate | Detect resource exhaustion and latency degradation |

These are proposed test profiles, not measured traffic forecasts. Record the actual duration, request rate, concurrency, and number of requests for every run.

## 7. Metrics to Record

For each test run, record:

- Total requests and successful requests.
- Failed requests, grouped by status code and error code.
- Throughput in requests per second.
- Median response time (p50).
- p95 and p99 response times.
- Database CPU, memory, connection usage, and transaction behavior.
- Redis health and resource usage where relevant.
- Accepted booking count and total reserved tons.
- Duplicate active bookings and invariant violations.
- Timeout rate and unexpected server errors.

Performance targets must be agreed upon before declaring a run successful. Correctness and capacity safety are mandatory regardless of response time.

## 8. Results Log

Create one entry per executed test run.

| Run ID | Date and time | Scenario | Requests | Failures | p95 latency | Capacity invariant | Outcome |
|---|---|---|---:|---:|---:|---|---|
| Not run | — | — | — | — | — | Not measured | Pending |

Do not replace missing measurements with estimates. Record test failures and unexpected results as well as successful runs.

## 9. Defect and Follow-up Log

For each issue, record:

- Reproduction steps.
- Expected and actual behavior.
- Relevant request IDs and sanitized logs.
- Whether database invariants were violated.
- Root cause, fix, and regression test.
- Results of the rerun.

Never include passwords, tokens, OTPs, or other secrets in this report.

## 10. Exit Criteria

Load testing is complete only when:

1. The critical concurrency test runs against real PostgreSQL.
2. No capacity invariant or active-booking uniqueness violation occurs.
3. Transaction rollback and idempotency behavior are verified.
4. The defined smoke, baseline, and elevated-load profiles have recorded results.
5. Performance measurements and environment details are documented.
6. Failures have been investigated and regression-tested.
7. The report distinguishes measured results from planned tests.

**Current conclusion:** No load-test conclusion can be made until the application and tests have been implemented and executed.