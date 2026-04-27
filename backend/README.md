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

## Deployment

The app is deployed to a Raspberry Pi using [Kamal](https://kamal-deploy.org/) and exposed publicly via a Cloudflare Tunnel — no open ports required on the Pi.

### Architecture

```
Users → HTTPS → Cloudflare (SSL termination) → Cloudflare Tunnel → Raspberry Pi (Kamal/Docker, port 80)
```

- SSL is terminated at Cloudflare; the tunnel connection uses QUIC.
- Kamal proxy runs on port 80 and routes traffic to the Rails container.
- Cloudflared runs as a systemd service on the Pi.

### Prerequisites

- `.env` file at the project root with the required variables (see `.env.example`).
- `backend/config/master.key` present locally (never committed).
- `gh auth login` done on the deploy machine (used to pull the GHCR token).

### Deploy

```bash
cd backend
kamal deploy
```

### Useful Kamal aliases

```bash
kamal app logs -f
kamal console   # Rails console
kamal shell     # bash inside the container
kamal dbc       # database console
```

### Cloudflare Tunnel

Managed as a systemd service on the Pi. Config lives at `/etc/cloudflared/config.yml`.

```bash
ssh pi "sudo systemctl status cloudflared"
```

## Environment Variables

See `.env.example` at the repo root for the full list with comments. Key variables:

| Variable | Required | Description |
|---|---|---|
| `RAILS_MASTER_KEY` | Yes | Contents of `config/master.key` — never commit |
| `DEVISE_JWT_SECRET_KEY` | Yes | JWT signing secret — `openssl rand -hex 64` |
| `DATABASE_URL` | Yes | Full PostgreSQL connection URL |
| `POSTGRES_PASSWORD` | Yes | Password for the Kamal PostgreSQL accessory |
| `APP_HOST` | Yes | Public hostname used in email links |
| `SMTP_FROM` | Yes | From address on outbound emails |
| `SMTP_DOMAIN` | Yes | HELO domain for SMTP |
| `SMTP2GO_USERNAME` | Yes (email) | SMTP2GO SMTP user (primary provider) |
| `SMTP2GO_PASSWORD` | Yes (email) | SMTP2GO SMTP password |
| `SENDPULSE_USERNAME` | No | SendPulse SMTP login (fallback provider) |
| `SENDPULSE_PASSWORD` | No | SendPulse SMTP password |
| `PASSWORD_RESET_MAX_REQUESTS` | No | Rate limit window count (default: 5) |
| `PASSWORD_RESET_PERIOD_SECONDS` | No | Rate limit window in seconds (default: 1200) |
