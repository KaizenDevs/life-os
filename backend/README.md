# Life OS — Backend

A Rails 8.1 API backend for the Life OS project.

## Tech Stack

- **Ruby** 4.0.1
- **Rails** 8.1.2 (API-only mode)
- **PostgreSQL** 16
- **Authentication:** Devise + devise-jwt (JWT tokens)

## Prerequisites

- Ruby 4.0.1
- PostgreSQL 16
- Bundler

Or simply: Docker + Docker Compose

## Getting Started

### With Docker (recommended)

From the project root:

```bash
docker compose -f docker-compose.dev.yml up
```

The API will be available at `http://localhost:3000`.

### Without Docker

```bash
bundle install
bin/setup         # Creates and prepares the databases
bin/rails server
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DEVISE_JWT_SECRET_KEY` | Production only | JWT signing secret (falls back to `secret_key_base` in dev/test) |
| `BACKEND_DATABASE_PASSWORD` | Production only | PostgreSQL password |
| `CORS_ORIGINS` | No | Comma-separated list of allowed origins (default: `localhost:3000`) |
| `DATABASE_URL` | No | Full PostgreSQL connection URL |

## API

All endpoints under `/api/v1/` require a `Authorization: Bearer <token>` header.

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/users` | Register a new user |
| `POST` | `/users/sign_in` | Sign in — returns JWT in `Authorization` header |
| `DELETE` | `/users/sign_out` | Sign out — revokes the JWT |

### Providers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/providers` | List providers (supports `q`, `category`, `archived` params) |
| `GET` | `/api/v1/providers/:id` | Get a provider |
| `POST` | `/api/v1/providers` | Create a provider |
| `PATCH` | `/api/v1/providers/:id` | Update a provider |
| `POST` | `/api/v1/providers/:id/archive` | Soft-delete a provider |
| `POST` | `/api/v1/providers/:id/unarchive` | Restore a provider |
| `DELETE` | `/api/v1/providers/:id` | Hard-delete a provider |

**Provider attributes:** `name` (required), `category` (required), `phone`, `email`, `address`, `notes`

**Valid categories:** `plumber`, `mechanic`, `curtains`, `electrician`, `painter`, `other`

### Response Format

```json
// Success
{ "data": { ... } }

// Error
{ "errors": ["message"] }

// Auth failure (401)
{ "error": "message" }
```

## Running Tests

```bash
bundle exec rspec
```

## Database

```bash
bin/rails db:create db:migrate   # Setup
bin/rails db:migrate             # Run pending migrations
bin/rails db:rollback            # Roll back last migration
```
