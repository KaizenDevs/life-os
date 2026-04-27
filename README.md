# life-os

Daily organizer for day-to-day activities (providers, and more modules later).

- **Backend**: Rails 8 API — `backend/`
- **Frontend**: React PWA — `frontend/`
- **Architecture**: [docs/architecture/life-os-providers-api.md](docs/architecture/life-os-providers-api.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Getting started

Clone the repo and run the setup script to install dependencies and configure git hooks:

```bash
bin/setup
```

> After cloning, `bin/setup` must be run once to activate the pre-commit hook that runs all tests before every commit.

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

### Frontend (PWA)

```bash
bun install --cwd frontend   # install dependencies (first time)
bun run dev                  # start Vite dev server on http://localhost:5173
bun test                     # run frontend tests
```

The frontend fetches `/api/v1/version` on boot and logs the current version to the browser console.

### Pre-commit hook

Before every commit the hook runs **frontend** tests (`bun test`) and **backend** tests (RSpec in the Docker `web` container). The commit is aborted if either fails or if the backend cannot run (Docker not available, daemon down, or `web` not running — start with `docker compose up -d`).

To **skip backend tests once** (not recommended): `SKIP_BACKEND_PRECOMMIT=1 git commit ...`

The hook lives in `.githooks/pre-commit` and is activated by `bin/setup`. To activate manually:

```bash
git config core.hooksPath .githooks
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

**Check version** (public, no token needed):

```bash
curl http://localhost:3000/api/v1/version
# {"version":"1.0.1"}
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

The app is deployed to a Raspberry Pi via [Kamal](https://kamal-deploy.org) and served at **https://lifeos.kaizendevs.com**. The image is built from `backend/Dockerfile` (build context: repo root) and served via [Thruster](https://github.com/basecamp/thruster) behind kamal-proxy.

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DEPLOY_HOST` | IP or hostname of the target server |
| `GITHUB_USERNAME` | GitHub username (for GHCR image registry) |
| `APP_HOST` | Public hostname, e.g. `lifeos.kaizendevs.com` |
| `DATABASE_URL` | Full Postgres URL, e.g. `postgres://user:pass@life-os-db/backend_production` |
| `DEVISE_JWT_SECRET_KEY` | Long random secret for signing JWTs — `openssl rand -hex 64` |
| `RAILS_MASTER_KEY` | Value from `backend/config/master.key` (never commit this file) |
| `POSTGRES_PASSWORD` | Password for the managed PostgreSQL accessory |
| `SMTP_FROM` | From address on outbound emails, e.g. `noreply@yourdomain.com` |
| `SMTP_DOMAIN` | HELO domain for SMTP — usually matches `APP_HOST` |
| `SMTP2GO_USERNAME` | SMTP2GO SMTP user (primary email provider) |
| `SMTP2GO_PASSWORD` | SMTP2GO SMTP password |
| `SENDPULSE_USERNAME` | SendPulse SMTP login (fallback email provider) |
| `SENDPULSE_PASSWORD` | SendPulse SMTP password |

### Deploy

```bash
make deploy
```

### Release

To bump the version, tag, create a GitHub Release, and deploy in one step:

```bash
make release VERSION=1.2.0
```

This will:
1. Write the new version to `VERSION`
2. Commit and tag `v1.2.0`
3. Push to `main` with the tag
4. Create a GitHub Release with auto-generated notes
5. Build and deploy to production

### First-time server setup

```bash
make deploy-setup
```
