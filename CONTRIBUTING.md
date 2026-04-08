# Contributing to life-os

## Branching

- **`main`**: Always deployable. Protected; no direct pushes.
- **Feature branches**: Use prefixes like `feature/`, `fix/`, `chore/`:
  - `feature/providers-search`
  - `fix/auth-token-expiry`
  - `chore/update-deps`

Keep branches short-lived and merge often (trunk-based style).

## Commits

- One logical change per commit (code + tests).
- **Message format**: imperative, present tense.
  - Good: `Add providers archive endpoint`, `Configure CORS for API`
  - Optional: [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat: add providers search`, `fix: handle missing JWT`.

## Pull requests

- Open a PR from your branch into `main`.
- Keep PRs small and focused.
- In the description include:
  - **Summary**: what and why.
  - **Changes**: bullet list.
  - **Test plan**: e.g. `bundle exec rspec` in `backend/`, `docker compose up` sanity check.
- CI must be green before merge (tests run on push/PR).

## CI

- GitHub Actions runs on push and pull requests to `main`.
- Backend: RSpec via Docker.
- Frontend: `bun test`.
- Fix any failing tests or lint before merging.

## Environment setup

Copy `.env.example` to `.env` and fill in the values before running or deploying:

```bash
cp .env.example .env
```

See the [Deployment section in README.md](README.md#deployment) for a full description of each variable.

## Running tests locally

```bash
# Backend (requires Docker web container running)
docker compose up -d
docker compose exec -T -e RAILS_ENV=test web bundle exec rspec

# Frontend
bun test --cwd frontend
```

## Releases

To cut a release:

```bash
make release VERSION=1.2.0
```

See [README.md](README.md#release) for details.
