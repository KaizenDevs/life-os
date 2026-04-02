# Life OS — Backend

A Rails 8.1 API backend for the Life OS project.

**Architecture, API reference & role documentation:** [docs/architecture/life-os-providers-api.md](../docs/architecture/life-os-providers-api.md)

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
bin/setup
bin/rails server
```

## Running Tests

```bash
bundle exec rspec
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DEVISE_JWT_SECRET_KEY` | Production only | JWT signing secret |
| `BACKEND_DATABASE_PASSWORD` | Production only | PostgreSQL password |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `localhost:3000`) |
| `DATABASE_URL` | No | Full PostgreSQL connection URL |
