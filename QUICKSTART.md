# Start life-os with Docker (3 steps)

## Step 1: Start the app

Copy `.env.example` to `.env` and fill in the values, then:

```bash
docker compose up -d
```

Wait about 15–20 seconds for the first start (downloads images and runs migrations).

---

## Step 2: Create your user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"me@example.com","password":"password123","password_confirmation":"password123"}}'
```

You should see a short JSON response (no error = success).

---

## Step 3: Sign in and call the API

**Sign in** (copy the token from the response):

```bash
curl -i -X POST http://localhost:3000/users/sign_in \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"me@example.com","password":"password123"}}'
```

In the response, find the line that looks like:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**List providers** (replace `PASTE_TOKEN_HERE` with that token):

```bash
curl http://localhost:3000/api/v1/providers \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

**Create a provider:**

```bash
curl -X POST http://localhost:3000/api/v1/providers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"provider":{"name":"Acme Plumber","category":"plumber","phone":"555-1234"}}'
```

---

## Useful commands

| What you want              | Command                                              |
|----------------------------|------------------------------------------------------|
| Stop the app               | `docker compose down`                                |
| View logs                  | `docker compose logs -f web`                         |
| Start again                | `docker compose up -d`                               |
| Check version              | `curl http://localhost:3000/api/v1/version`          |
| **Development** (hot-reload) | `make dev`                                         |
| Stop dev stack             | `make stop-dev`                                      |
| Run backend tests          | `docker compose exec -T -e RAILS_ENV=test web bundle exec rspec` |
| Run frontend tests         | `bun test --cwd frontend`                            |
| Deploy to production       | `make deploy`                                        |
| Release new version        | `make release VERSION=1.2.0`                         |

Local API base URL: **http://localhost:3000**

> Production is available at **https://lifeos.kaizendevs.com** (deployed to Raspberry Pi via Kamal + Cloudflare Tunnel).
