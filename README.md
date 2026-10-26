# Parali-to-CBG Marketplace

## Project Overview

Parali-to-CBG Marketplace is a platform designed to connect farmers selling agricultural residue, such as paddy straw, with Compressed Biogas (CBG) plants that require biomass feedstock.

The goal is to help farmers discover nearby plants, compare prices, and request deliveries while helping CBG operators manage daily capacity and bookings.

## Current Status

The project is in the setup and planning phase.

- PostgreSQL and PostGIS database schema created and tested against a fresh database.
- Redis configured through Docker Compose.
- Nine CBG plant records imported from the supplied plant register.
- FastAPI backend foundation with health endpoints, async database access, Alembic baseline, and CI against PostGIS.
- Plant verification, pricing, authentication, booking workflows, and application services remain to be implemented and tested.

## Planned Features

- Farmer, CBG operator, transporter, and administrator roles.
- Phone-based OTP authentication.
- Farmer profiles and straw collection requests.
- Nearby plant recommendations using geographic and road-distance calculations.
- Capacity-aware booking with protection against overbooking.
- Booking status tracking and delivery verification.
- Transporter discovery and transport requests.
- Price history, payment ledger, and PDF receipts.
- English, Hindi, and Punjabi language support.
- Notifications, audit logs, and background jobs.

## Planned Technology Stack

**Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 async, asyncpg, PostgreSQL, PostGIS, Alembic, Redis, and ARQ.

**Frontend:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, React Leaflet, and next-intl.

**Infrastructure and testing:** Docker Compose, pytest, Playwright, Ruff, mypy, and GitHub Actions.

These technologies describe the intended architecture; not all components are implemented yet.

## Repository Structure

- `apps/api/` — FastAPI backend (foundation implemented).
- `apps/web/` — planned Next.js application.
- `apps/worker/` — planned background jobs.
- `backend/` — existing backend files, not yet migrated.
- `frontend/` — existing frontend files, not yet migrated.
- `infra/postgres/init/` — database schema.
- `infra/postgres/seed/` — CBG plant seed data.
- `docs/ASSUMPTIONS.md` — business rules and assumptions.
- `docker-compose.yml` — current local infrastructure configuration.

## Prerequisites

- Docker Desktop
- Git
- Python 3.12
- Node.js LTS and npm

Python and Node.js are needed when running the application services locally. The current Docker Compose configuration starts PostgreSQL and Redis only.

## Local Setup

### 1. Configure environment variables

If you do not already have a local `.env` file, create one from the example:

    cp .env.example .env

Edit the file to use suitable local settings. Never commit `.env` files or real credentials. If a working `.env` already exists, do not overwrite it.

### 2. Start PostgreSQL and Redis

From the repository root:

    docker compose up -d postgres redis
    docker compose ps

Wait until both services report healthy.

### 3. Initialize the database

The initialization SQL is applied automatically only when PostgreSQL initializes a new, empty data directory. If an existing database has not been initialized, apply the schema manually:

    docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U parali_app -d parali_marketplace < infra/postgres/init/001_schema.sql

Do not delete or reset a database volume containing data you want to keep.

### 4. Load plant seed data

After the schema exists, run:

    docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U parali_app -d parali_marketplace < infra/postgres/seed/001_cbgs.sql

Verify the count:

    docker compose exec -T postgres psql -U parali_app -d parali_marketplace -c "SELECT COUNT(*) FROM cbgs;"

The supplied register contains nine plant records. Seeded records are not necessarily verified, and pricing has not yet been configured.

### 5. Check Redis

    docker compose exec redis redis-cli ping

Expected output: `PONG`.

## Backend Setup (apps/api)

The API needs a PostgreSQL 17 database with PostGIS. Use either the Docker steps above or the local Homebrew route below.

### Option B: local Homebrew PostgreSQL (macOS)

Homebrew PostgreSQL has no `postgres` OS user. The superuser is your macOS username, so run the admin commands below as yourself, without `sudo -u postgres`.

```bash
brew install postgresql@17 postgis
brew services start postgresql@17

psql -d postgres -c "CREATE ROLE parali_app LOGIN PASSWORD 'choose_a_local_password';"
psql -d postgres -c "CREATE DATABASE parali_marketplace OWNER parali_app;"
psql -d parali_marketplace -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -d parali_marketplace -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -d parali_marketplace -c "GRANT ALL ON SCHEMA public TO parali_app;"
```

Apply the schema (stops at the first error and rolls everything back). Run this from the repository root:

```bash
psql -U parali_app -d parali_marketplace -v ON_ERROR_STOP=1 --single-transaction \
  -f infra/postgres/init/001_schema.sql
```

Optionally load the plant seed data (run once only):

```bash
psql -U parali_app -d parali_marketplace -v ON_ERROR_STOP=1 -f infra/postgres/seed/001_cbgs.sql
```

### Python environment and settings

From the repository root:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
cd apps/api
python -m pip install -e ".[dev]"
```

In the root `.env`, set `DATABASE_URL` (format: `postgresql+asyncpg://parali_app:<password>@localhost:5432/parali_marketplace`) and `JWT_SECRET_KEY`. Generate the secret without printing it:

```bash
printf 'JWT_SECRET_KEY=%s\n' "$(python -c 'import secrets; print(secrets.token_urlsafe(64))')" >> ../../.env
```

Outside development, the app refuses to start if `JWT_SECRET_KEY` is shorter than 32 characters. Never commit `.env` or paste its contents anywhere.

### Database migrations (Alembic)

`001_schema.sql` is the baseline. Alembic revision `bc00f7130ca4` is an empty baseline that matches it, so all later schema changes go through Alembic.

```bash
cd apps/api
alembic upgrade head
alembic current
alembic revision -m "describe the change"
```

Do not generate tables from the ORM models. They do not cover everything in the SQL schema (PostGIS indexes, check constraints, enums).

### Run checks and start the server

```bash
cd apps/api
pytest -q && ruff check . && mypy . && pip check
uvicorn app.main:app --port 8000
```

Then verify:

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/health/ready
```

`/health/ready` returns 503 if the database is unreachable or empty. GitHub Actions runs the same checks against a PostGIS service container.

## Business Rules

- Booking and delivery times use the `Asia/Kolkata` time zone.
- The planned daily booking cutoff is 15:00 IST.
- The planned delivery deadline is 19:00 IST.
- Capacity must be reserved atomically to prevent overbooking.
- Plants must be verified and have configured pricing and capacity before real bookings are enabled.

See `docs/ASSUMPTIONS.md` for detailed business rules and decisions to confirm.

## Development and Testing

Application services and automated tests are not yet fully implemented. Do not assume that authentication, booking, transport, or other planned features are available until their implementation and tests are complete.

Future testing will include unit tests, database integration tests, concurrent booking tests against real PostgreSQL, and critical Playwright user flows.

## Security

- Keep `.env` files and credentials out of version control.
- Use strong, separate secrets outside local development.
- Never expose private credentials through `NEXT_PUBLIC_` variables.
- Enforce role-based and object-level authorization in the backend.
- Do not enable real bookings for unverified plants or plants without configured prices and capacity.

## Documentation

- `docs/ASSUMPTIONS.md` — business rules and assumptions.
- `docs/ARCHITECTURE.md` — architecture documentation to be completed.
- `docs/API.md` — API documentation to be completed.
- `docs/LOAD_TEST_REPORT.md` — load-test results to be recorded after testing.