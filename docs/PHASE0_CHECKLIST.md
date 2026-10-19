# Phase 0 — Setup and Planning Checklist

## Status

**Phase status:** Setup and planning verified; application implementation pending.

## 1. Project Documentation

- [x] `README.md`
- [x] `docs/ASSUMPTIONS.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/API.md` — proposed API contract
- [x] `docs/LOAD_TEST_REPORT.md` — planned tests; no results fabricated

## 2. Environment and Configuration

- [x] Root `.env.example`
- [x] `apps/api/.env.example`
- [x] `apps/web/.env.example`
- [x] `apps/worker/.env.example`
- [x] Git ignore rules tested in a temporary repository
- [x] Real `.env` files are ignored
- [x] Example environment templates remain eligible for version control
- [ ] Initialize Git in the project when ready to establish version control

## 3. Database and Local Infrastructure

- [x] Docker Compose configuration validated
- [x] PostgreSQL 16 running and healthy
- [x] PostGIS extension verified
- [x] Redis running and healthy
- [x] Database schema applied
- [x] Fresh-database schema application tested
- [x] Nine CBG plant records seeded and verified
- [x] Plant records remain unverified until an authorized verification process is implemented

## 4. Planned Application Scaffolding

These files remain empty or require implementation:

- [ ] `apps/api/app/main.py`
- [ ] `apps/api/pyproject.toml`
- [ ] `apps/web/package.json`
- [ ] `apps/web/app/middleware.ts`
- [ ] `apps/worker/cron.py`
- [ ] `.github/workflows/ci.yml`

Their absence does not invalidate the verified setup, but application startup and CI are not yet complete.

## 5. Tests Actually Performed

- [x] Docker Compose configuration check passed
- [x] PostgreSQL and PostGIS health/version checks passed
- [x] Redis health check passed
- [x] Database schema successfully applied to a temporary fresh database
- [x] Seed operation inserted nine plant records
- [x] Documentation files checked for existence and nonzero size
- [x] Git ignore behavior tested in a temporary repository

## 6. Tests Not Yet Performed

- [ ] FastAPI endpoint tests
- [ ] Authentication and authorization tests
- [ ] Booking and transaction integration tests
- [ ] 200-concurrent-request capacity test against real PostgreSQL
- [ ] Idempotency and rollback tests
- [ ] Background-job and expiry tests
- [ ] Frontend and Playwright end-to-end tests
- [ ] k6 or Locust load tests
- [ ] CI pipeline execution

## 7. Phase 1 Entry Criteria

Before feature implementation, confirm:

- [ ] Existing `frontend/` and `backend/` directories are preserved
- [ ] Backend dependencies and application settings are defined
- [ ] Database connection lifecycle is configured
- [ ] Structured logging and request IDs are planned
- [ ] `/health` and `/ready` behavior is defined
- [ ] Tests can run against the configured development environment

## Final Assessment

The project has a verified planning baseline, documented API and architecture, a reproducible database schema, local PostgreSQL/PostGIS and Redis services, and seeded plant records.

The marketplace itself is not yet operational. Phase 1 will establish the backend foundation before business features are implemented.