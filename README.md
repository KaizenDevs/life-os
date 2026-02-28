# life-os

Daily organizer for day-to-day activities (providers, and more modules later).

- **Backend**: Rails 8 API — `backend/`
- **Architecture**: [docs/architecture/life-os-providers-api.md](docs/architecture/life-os-providers-api.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Development

The recommended way to develop is with Docker so you don't need a local Ruby or PostgreSQL install.

### With Docker (recommended)

```bash
make dev
```

This builds the dev image (first run takes a few minutes), starts PostgreSQL, runs migrations, and boots Rails on http://localhost:3000. Code changes in `backend/` are reflected immediately — no rebuild needed.

```bash
make stop-dev      # stop the stack
```

Logs:

```bash
docker compose -f docker-compose.dev.yml logs -f web
```

Run the test suite inside the running container:

```bash
docker compose -f docker-compose.dev.yml exec web bundle exec rspec
```

### Without Docker (native Ruby + Postgres)

Prerequisites: Ruby 4.0.1, PostgreSQL 16 running locally.

```bash
make setup    # bundle install + db:create + db:migrate
make test     # run RSpec
make run      # start Rails on http://localhost:3000
```

---

## API quick reference

**Sign up:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"you@example.com","password":"password123","password_confirmation":"password123"}}'
```

**Sign in** (copy the `Authorization: Bearer <token>` header from the response):

```bash
curl -i -X POST http://localhost:3000/users/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"you@example.com","password":"password123"}}'
```

**List providers:**

```bash
curl http://localhost:3000/api/v1/providers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a provider:**

```bash
curl -X POST http://localhost:3000/api/v1/providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"provider":{"name":"Acme Plumber","category":"plumber","phone":"555-1234"}}'
```

---

## Deployment

The production image is built from `backend/Dockerfile` and served via [Thruster](https://github.com/basecamp/thruster) on port 80.

### Required environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full Postgres URL, e.g. `postgres://user:pass@host:5432/dbname` |
| `DEVISE_JWT_SECRET_KEY` | Long random secret for signing JWTs — generate with `openssl rand -hex 64` |
| `RAILS_MASTER_KEY` | Value from `backend/config/master.key` (never commit this file) |

### Option A: Docker Compose on a VPS

Copy the repo to your server, set the required env vars, and run:

```bash
DEVISE_JWT_SECRET_KEY=<secret> docker compose up -d
```

The stack starts PostgreSQL and the Rails app. The app is available on port 3000 (put Nginx or Caddy in front for TLS).

To update after a code change:

```bash
docker compose build web
docker compose up -d
```

### Option B: Kamal

The Dockerfile is Kamal-compatible. Add a `config/deploy.yml` (see [Kamal docs](https://kamal-deploy.org)) and deploy with:

```bash
kamal setup   # first time
kamal deploy  # subsequent deploys
```

Set secrets in `.kamal/secrets` (never commit this file).
