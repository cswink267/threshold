# Everyday commands. Run `make` to list them.
.DEFAULT_GOAL := help
.PHONY: help up down logs migrate revision test test-integration lint check contrast

help: ## List commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-18s %s\n", $$1, $$2}'

up: ## Start everything in Docker (site :4321, API :8000)
	docker compose up --build

down: ## Stop everything
	docker compose down

logs: ## Follow the logs
	docker compose logs -f

migrate: ## Apply migrations
	docker compose exec api alembic upgrade head

revision: ## New migration from model changes: make revision m="add tags"
	docker compose exec api alembic revision --autogenerate -m "$(m)"

test: ## API unit tests (no services needed)
	cd apps/api && uv run pytest

test-integration: ## API tests against the running Postgres and Redis
	cd apps/api && uv run alembic upgrade head && INTEGRATION=1 uv run pytest

lint: ## Lint and format-check the API
	cd apps/api && uv run ruff check . && uv run ruff format --check .

check: ## Type-check and build the site
	cd apps/web && npm run check && npm run build

contrast: ## Check the contrast of the world's colors
	cd apps/web && npm run contrast
