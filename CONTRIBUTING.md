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
- Backend: Ruby + PostgreSQL; runs `db:create db:migrate` and `bundle exec rspec` in `backend/`.
- Fix any failing tests or lint before merging.

## Running tests locally

```bash
cd backend
bundle install
# With PostgreSQL running:
bin/rails db:create db:migrate
bundle exec rspec
```
