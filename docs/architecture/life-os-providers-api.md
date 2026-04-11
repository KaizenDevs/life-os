# Life OS – Architecture

This document is the **source of truth** for the life-os backend: an API-only Rails app for day-to-day records.

## High-level architecture

- **Backend**: Rails 8.1 API-only app in `backend/`, Ruby 4.0.x.
- **Database**: PostgreSQL in its own Docker container when using Docker; otherwise local Postgres.
- **Authentication**: Devise + devise-jwt (stateless JWT, revocation via JTI).
- **Authorization**: Pundit — role-based, two-tier (system role + group membership role).
- **Rate limiting**: Rack::Attack — throttles abuse-prone endpoints (e.g. password reset).
- **Email**: Action Mailer over SMTP; configured via env vars (see [Email](#email)).
- **Testing**: RSpec, FactoryBot, Shoulda Matchers.
- **CI**: GitHub Actions (root `.github/workflows/ci.yml`) runs backend tests with a Postgres service.

## User roles

Roles operate at two levels: **system-wide** and **group-level**.

### System roles (`users.system_role`)

| Role | Description |
|------|-------------|
| `super_admin` | Full platform access. Can create and manage all groups and users. |
| `user` | Default role. Access is determined by group memberships. |

### Group membership roles (`memberships.role`)

A user can belong to multiple groups, each with an independent role.

| Role | Description |
|------|-------------|
| `admin` | Manages the group: invites/removes members, updates group settings. At least one admin per group. |
| `member` | Full access to group resources (read and write). |
| `viewer` | Read-only access to group resources. |

### How they interact

- A `super_admin` can do anything within groups they created. They do not have visibility into other users' groups — this preserves user privacy.
- A `user` can create up to 3 groups. On creation, they are automatically added as group `admin`.
- A `user` with no group memberships has no access to any group resources.
- A `user` can be `admin`, `member`, or `viewer` in different groups simultaneously.
- Group membership is invite-based (`invited_by`, `accepted_at` on the membership record). Pending invitations are visible in the membership list; the invited user accepts via the UI.
- `viewer` members can only read resources within their group — no create, update, or delete.
- A group must always have at least one `admin`. Removing or demoting the last admin is forbidden at the model level.

### Scoping principle

Every API response is scoped to the current user. Users never see data outside the groups they belong to. This applies to all resources: groups, memberships, and providers.

## Auth

- **Sign in**: `POST /users/sign_in` with `{ user: { email, password } }` → responds with `Authorization: Bearer <jwt>`.
- **Sign out**: `DELETE /users/sign_out` with `Authorization: Bearer <jwt>`.
- **Sign up**: `POST /users` with `{ user: { email, password, password_confirmation } }`.
- JWT secret: set `DEVISE_JWT_SECRET_KEY` in production; dev/test fall back to `secret_key_base`.

### Password reset

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users/password` | Request a reset link. Always returns 200 (no email enumeration). |
| PUT | `/users/password` | Submit new password with the token from the email. |

Reset tokens expire per Devise defaults. The same token cannot be used twice.

**Abuse prevention (Rack::Attack):** The `POST /users/password` endpoint is throttled by both IP and email address. Defaults: 5 requests per 20 minutes. Configurable via env vars:

| Env var | Default | Description |
|---------|---------|-------------|
| `PASSWORD_RESET_MAX_REQUESTS` | `5` | Max requests per window |
| `PASSWORD_RESET_PERIOD_SECONDS` | `1200` | Window size in seconds (20 min) |

Requests over the limit receive `429 Too Many Requests` with a JSON error body.

## Email

Email is sent via Action Mailer over SMTP. Configuration is driven entirely by env vars:

| Env var | Required | Description |
|---------|----------|-------------|
| `SMTP_ADDRESS` | Yes (for live delivery) | SMTP server hostname |
| `SMTP_PORT` | No (default: 587) | SMTP port |
| `SMTP_DOMAIN` | Yes | HELO domain |
| `SMTP_USERNAME` | No | SMTP auth username (omit for unauthenticated relay) |
| `SMTP_PASSWORD` | No | SMTP auth password |
| `SMTP_FROM` | Yes | From address on outbound emails |
| `APP_HOST` | No (default: `lifeos.kaizendevs.com`) | Host used in mailer link generation |

If `SMTP_ADDRESS` is not set, the app falls back to `:test` delivery (emails are not sent, silently collected in `ActionMailer::Base.deliveries`).

Compatible with any standard SMTP provider: AWS SES, Postmark, SendGrid, Mailgun, or a self-hosted relay.

## API (all under `/api/v1`, all require `Authorization: Bearer <token>`)

### Providers

Providers belong to a group and are always accessed in that context. Users only see providers from groups they belong to.

| Method | Path | Description | Who can |
|--------|------|-------------|---------|
| GET | /api/v1/groups/:group_id/providers | List (optional: `q`, `category`, `archived=true`) | `admin`, `member`, `viewer` |
| GET | /api/v1/groups/:group_id/providers/:id | Show | `admin`, `member`, `viewer` |
| POST | /api/v1/groups/:group_id/providers | Create | `admin`, `member` |
| PATCH/PUT | /api/v1/groups/:group_id/providers/:id | Update | `admin`, `member` |
| POST | /api/v1/groups/:group_id/providers/:id/archive | Soft-delete | `admin`, `member` |
| POST | /api/v1/groups/:group_id/providers/:id/unarchive | Restore | `admin`, `member` |
| DELETE | /api/v1/groups/:group_id/providers/:id | Hard delete | `admin` only |

Provider attributes: `name` (required), `category` (required — plumber, mechanic, curtains, electrician, painter, other), `phone`, `email`, `address`, `notes`, `archived_at`, `group_id`.

### Groups

Results are always scoped: `super_admin` sees only groups they created; regular users see only groups they are a member of (including ones they created).

| Method | Path | Description | Who can |
|--------|------|-------------|---------|
| GET | /api/v1/groups | List — returns only groups the current user belongs to | Any authenticated user |
| GET | /api/v1/groups/:id | Show | `super_admin` (creator) or any group member (`admin`, `member`, `viewer`) |
| POST | /api/v1/groups | Create | `super_admin` (unlimited) or any `user` (max 3 groups) |
| PATCH/PUT | /api/v1/groups/:id | Update | `super_admin` (creator) or group `admin` |
| POST | /api/v1/groups/:id/archive | Soft-delete | `super_admin` (creator) or group `admin` |
| POST | /api/v1/groups/:id/unarchive | Restore | `super_admin` (creator) only |
| DELETE | /api/v1/groups/:id | Hard delete | `super_admin` (creator) only |

Group attributes: `name`, `group_type` (household, company), `archived_at`.

### Memberships

Results are scoped to groups the current user belongs to. A user cannot discover members of a group they are not part of.

| Method | Path | Description | Who can |
|--------|------|-------------|---------|
| GET | /api/v1/groups/:group_id/memberships | List members (scoped) | Any group member (`admin`, `member`, `viewer`) |
| POST | /api/v1/groups/:group_id/memberships | Invite a user | `super_admin` (creator) or group `admin` |
| PATCH/PUT | /api/v1/groups/:group_id/memberships/:id | Update role | `super_admin` (creator) or group `admin` |
| DELETE | /api/v1/groups/:group_id/memberships/:id | Remove a member | `super_admin` (creator) or group `admin` |
| POST | /api/v1/groups/:group_id/memberships/:id/accept | Accept an invitation | The invited user only |

Membership attributes: `role` (admin, member, viewer), `accepted_at`, `invited_by_id`.

## Docker

Three compose files serve different purposes:

| File | Purpose | RAILS_ENV |
|------|---------|-----------|
| `docker-compose.yml` | Production / Raspberry Pi deploy | `production` |
| `docker-compose.dev.yml` | Local development with live code reload | `development` |
| `docker-compose.test.yml` | Run the full test suite in CI or locally | `test` |

### Production (`docker-compose.yml`)

`web` (Rails via Thruster) + `db` (Postgres 16). Named volume `postgres_data`. Only port 3000 is exposed to the host; Postgres is internal.

```bash
docker compose build
docker compose up -d
```

### Development (`docker-compose.dev.yml`)

Mounts `./backend` as a volume so code changes are reflected without rebuild. Exposes port 3000.

```bash
docker compose -f docker-compose.dev.yml up
```

### Test (`docker-compose.test.yml`)

Runs `bundle exec rspec` in an isolated container with `RAILS_ENV=test` and an in-memory Postgres via tmpfs. Use this to run tests — do not run `rspec` inside the production container.

```bash
docker compose -f docker-compose.test.yml run --rm web
```

### RAILS_ENV conventions

- **Production and staging** both use `RAILS_ENV=production`. Staging is differentiated by its env vars (`DATABASE_URL`, `DEVISE_JWT_SECRET_KEY`, `SMTP_*`), not by a separate Rails environment.
- **Tests** must run with `RAILS_ENV=test`. The production container has `RAILS_ENV=production` baked in — running `rspec` inside it via `docker compose exec web` will use the wrong environment. Always use the test compose file.

## Adding a new module

1. Create model and migration in `backend/`.
2. Add `Api::V1::*Controller` inheriting from `Api::V1::BaseController`.
3. Add `resources :thing` (and member actions if needed) under `namespace :api do namespace :v1`.
4. Add request specs under `spec/requests/api/v1/`, factories in `spec/factories/`.

## Docs

- **Source of truth**: this file (`docs/architecture/life-os-providers-api.md`).
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md) (branching, commits, PRs, CI).
