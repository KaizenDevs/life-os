# Start life-os with Docker (3 steps)

## Step 1: Start the app

Open a terminal in the project folder and run:

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
| **Development** (hot-reload) | `make dev`                                         |
| Stop dev stack             | `make stop-dev`                                      |
| Run tests (dev stack)      | `docker compose -f docker-compose.dev.yml exec web bundle exec rspec` |

API base URL: **http://localhost:3000**
