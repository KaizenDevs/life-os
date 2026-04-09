# Life OS – run from repo root
# Prerequisite: PostgreSQL running (locally or via Docker)

.PHONY: setup db test run run-docker stop-docker dev stop-dev test-docker test-docker-clean test-api deploy deploy-staging deploy-test release

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

# Run tests in an isolated test environment (ephemeral DB via tmpfs)
test-docker:
	docker compose -f docker-compose.test.yml run --rm web

# Tear down test stack and remove volumes
test-docker-clean:
	docker compose -f docker-compose.test.yml down -v

# Build image, push to GHCR, and deploy to Pi.
# Auto-detects if first-time setup is needed: runs `kamal setup` if the app
# container isn't found on the server, otherwise runs `kamal deploy`.
deploy:
	set -a && . ./.env && set +a && cd backend && \
	  if rbenv exec bundle exec kamal app details 2>/dev/null | grep -q "App"; then \
	    rbenv exec bundle exec kamal deploy; \
	  else \
	    rbenv exec bundle exec kamal setup; \
	  fi

# Deploy to staging environment.
# Same auto-detect logic as `deploy`: setup on first run, deploy on subsequent runs.
# DATABASE_URL is overridden with STAGING_DATABASE_URL so Kamal injects the correct value.
deploy-staging:
	set -a && . ./.env && set +a && export DATABASE_URL=$$STAGING_DATABASE_URL && cd backend && \
	  if rbenv exec bundle exec kamal app details -d staging 2>/dev/null | grep -q "App"; then \
	    rbenv exec bundle exec kamal deploy -d staging; \
	  else \
	    rbenv exec bundle exec kamal setup -d staging; \
	  fi

# Deploy to test environment.
# Same auto-detect logic as `deploy`: setup on first run, deploy on subsequent runs.
# DATABASE_URL is overridden with TEST_DATABASE_URL so Kamal injects the correct value.
deploy-test:
	set -a && . ./.env && set +a && export DATABASE_URL=$$TEST_DATABASE_URL && cd backend && \
	  if rbenv exec bundle exec kamal app details -d test 2>/dev/null | grep -q "App"; then \
	    rbenv exec bundle exec kamal deploy -d test; \
	  else \
	    rbenv exec bundle exec kamal setup -d test; \
	  fi

# Bump version, tag, and deploy. Usage: make release VERSION=1.2.0
release:
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=1.2.0" && exit 1)
	@echo "$(VERSION)" > VERSION
	git add VERSION
	git diff --cached --quiet || git commit -m "chore: release v$(VERSION)"
	git tag v$(VERSION)
	git push origin main --tags
	gh release create v$(VERSION) --title "v$(VERSION)" --generate-notes
	$(MAKE) deploy

# Quick API test (requires server running and a user); set TOKEN after sign-in
test-api:
	@echo "1. Sign in to get a token:"
	@echo '   curl -s -X POST http://localhost:3000/users/sign_in -H "Content-Type: application/json" -d ''{"user":{"email":"you@example.com","password":"yourpassword"}}'' -i | grep -i authorization'
	@echo ""
	@echo "2. List providers (paste token):"
	@echo '   curl -s http://localhost:3000/api/v1/providers -H "Authorization: Bearer YOUR_TOKEN"'
	@echo ""
	@echo "3. Or with TOKEN set: curl -s http://localhost:3000/api/v1/providers -H \"Authorization: Bearer $$TOKEN\""
