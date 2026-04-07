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

| Variable | Required | Description |
|---|---|---|
| `DEVISE_JWT_SECRET_KEY` | Production only | JWT signing secret |
| `BACKEND_DATABASE_PASSWORD` | Production only | PostgreSQL password |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `localhost:3000`) |
| `DATABASE_URL` | No | Full PostgreSQL connection URL |
