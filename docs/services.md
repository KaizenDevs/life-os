# External Services

All external dependencies for the Life OS project.

---

## Cloudflare

**Purpose:** DNS, SSL termination, and tunnel to expose the Pi without open ports.

**What it does:**
- `lifeos.kaizendevs.com`, `staging.lifeos.kaizendevs.com`, `test.lifeos.kaizendevs.com` all point to a Cloudflare Tunnel (CNAME records managed automatically by `cloudflared`).
- SSL is terminated at Cloudflare's edge — no certificate needed on the Pi.

**To swap:** Replace with any reverse proxy + Caddy/nginx with Let's Encrypt on a VPS. Update `deploy.yml` proxy config with `ssl: true`.

**Managed via:** Cloudflare dashboard + `cloudflared` service on the Pi.

---

## GitHub Container Registry (GHCR)

**Purpose:** Stores Docker images built by Kamal during deploys.

**What it does:** `kamal deploy` builds the image locally, pushes it to `ghcr.io/<username>/life-os`, then pulls it on the Pi.

**To swap:** Replace with Docker Hub, AWS ECR, or any OCI-compatible registry. Update `registry.server` in `backend/config/deploy*.yml`.

**Credentials:** `KAMAL_REGISTRY_PASSWORD` (GitHub token via `gh auth token`).

---

## GitHub Actions

**Purpose:** CI/CD — runs tests on every push/PR, auto-deploys to staging, manual deploys to production.

**Workflows:**
| File | Trigger |
|---|---|
| `ci.yml` | Push / PR |
| `deploy-staging.yml` | Push to `staging` branch (skip with `[skip deploy]`) |
| `deploy-test.yml` | Manual — picks any branch |
| `deploy-production.yml` | Manual — requires typing `"production"` |
| `release.yml` | Push to `main` — semantic-release |

**To swap:** Any CI platform (CircleCI, GitLab CI, etc.) — the deploy step is just `kamal deploy`.

---

## Postfix (self-hosted on Pi)

**Purpose:** Send-only mail server for transactional emails (password reset, etc.).

**What it does:** Rails delivers email to `localhost:25`, Postfix sends directly from `kaizendevs.com`.

**Deliverability note:** Residential/Pi IPs may land in spam. Acceptable for personal use; swap to an external provider for broader audiences.

**To swap to an external provider (e.g. Resend, Sendgrid, Postmark):**
1. Set in `.env` (and GitHub Actions secrets):
   ```
   SMTP_ADDRESS=smtp.resend.com
   SMTP_USERNAME=resend
   SMTP_PASSWORD=re_your_api_key
   SMTP_PORT=587
   ```
2. No code changes required — Rails reads from ENV via `config/initializers/mailer.rb`.

**Config script:** `bin/configure-postfix` — re-run after changing `SMTP_DOMAIN`.

---

## Mailpit (dev only)

**Purpose:** Local email catcher for development — no real emails sent.

**What it does:** All emails sent by Rails in development are captured by Mailpit. View them at `http://localhost:8025`.

**Runs via:** `docker-compose.dev.yml` — starts automatically with `docker compose -f docker-compose.dev.yml up`.
