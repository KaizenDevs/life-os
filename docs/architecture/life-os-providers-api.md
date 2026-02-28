# Life OS – Architecture (Providers API)

This document describes the architecture of the life-os backend: an API-only Rails app for day-to-day records, starting with a **providers** module and JWT authentication.

## High-level architecture

- **Backend**: Rails 8.1 API-only app in `backend/`, Ruby 4.0.x.
- **Database**: PostgreSQL in its own Docker container when using Docker; otherwise local Postgres.
- **Authentication**: Devise + devise-jwt (stateless JWT, revocation via JTI).
- **Authorization**: All authenticated users can manage providers (no roles yet).
- **Testing**: RSpec, FactoryBot, Shoulda Matchers.
- **CI**: GitHub Actions (root `.github/workflows/ci.yml`) runs backend tests with a Postgres service.

## Auth

- **Sign in**: `POST /users/sign_in` with `{ user: { email, password } }` → responds with `Authorization: Bearer <jwt>`.
- **Sign out**: `DELETE /users/sign_out` with `Authorization: Bearer <jwt>`.
- **Sign up**: `POST /users` with `{ user: { email, password, password_confirmation } }`.
- JWT secret: set `DEVISE_JWT_SECRET_KEY` in production; dev/test fall back to `secret_key_base`.

## API (all under `/api/v1`, all require `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/providers | List (optional: `q`, `category`, `archived=true`) |
| GET | /api/v1/providers/:id | Show |
| POST | /api/v1/providers | Create |
| PATCH/PUT | /api/v1/providers/:id | Update |
| DELETE | /api/v1/providers/:id | Destroy |
| POST | /api/v1/providers/:id/archive | Soft-archive |
| POST | /api/v1/providers/:id/unarchive | Restore |

Provider attributes: `name`, `category` (plumber, mechanic, curtains, electrician, painter, other), `phone`, `email`, `address`, `notes`, `archived_at`.

## Docker

- **docker-compose** (repo root): `web` (Rails) + `db` (Postgres 16), named volume `postgres_data`.
- Only port 3000 is exposed to the host; Postgres is internal.
- Build: `docker compose build`. Run: `docker compose up -d`.
- On Raspberry Pi: use the same compose file; images support ARM64.

## Adding a new module

1. Create model and migration in `backend/`.
2. Add `Api::V1::*Controller` inheriting from `Api::V1::BaseController`.
3. Add `resources :thing` (and member actions if needed) under `namespace :api do namespace :v1`.
4. Add request specs under `spec/requests/api/v1/`, factories in `spec/factories/`.

## Docs

- **Source of truth**: this file (`docs/architecture/life-os-providers-api.md`).
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md) (branching, commits, PRs, CI).
