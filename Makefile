# Life OS – run from repo root
# Prerequisite: PostgreSQL running (locally or via Docker)

.PHONY: setup db test run run-docker stop-docker dev stop-dev test-api

# Install deps and create/migrate DB (requires Postgres)
setup:
	cd backend && bundle install && bin/rails db:create db:migrate

# Only DB create + migrate
db:
	cd backend && bin/rails db:create db:migrate

# Run RSpec (requires Postgres)
test:
	cd backend && bundle exec rspec

# Start Rails server (requires Postgres and `make db` already run)
run:
	cd backend && bin/rails server

# Start everything with Docker (Postgres + Rails)
run-docker:
	docker compose up -d
	@echo "Waiting for app to be ready..."
	@sleep 5
	@echo "API: http://localhost:3000"

# Stop Docker stack
stop-docker:
	docker compose down

# Start dev stack (Postgres + Rails in development mode, code hot-reloads via volume)
dev:
	docker compose -f docker-compose.dev.yml up

# Stop dev stack
stop-dev:
	docker compose -f docker-compose.dev.yml down

# Quick API test (requires server running and a user); set TOKEN after sign-in
test-api:
	@echo "1. Sign in to get a token:"
	@echo '   curl -s -X POST http://localhost:3000/users/sign_in -H "Content-Type: application/json" -d ''{"user":{"email":"you@example.com","password":"yourpassword"}}'' -i | grep -i authorization'
	@echo ""
	@echo "2. List providers (paste token):"
	@echo '   curl -s http://localhost:3000/api/v1/providers -H "Authorization: Bearer YOUR_TOKEN"'
	@echo ""
	@echo "3. Or with TOKEN set: curl -s http://localhost:3000/api/v1/providers -H \"Authorization: Bearer $$TOKEN\""
