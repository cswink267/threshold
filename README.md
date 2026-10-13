# Threshold

The starter every project begins from: **Astro** and **FastAPI** on **Postgres** and **Redis**, with **pgvector** ready for when a project needs it, and an immersion layer that turns pages into places.

## Run it

```bash
cp .env.example .env
docker compose up --build
```

The site is at http://localhost:4321 and the API at http://localhost:8000, with interactive docs at `/docs`. Add a note there with `POST /entries` and it appears at the bottom of the site.

To run the apps on your machine instead, start only the data services in Docker:

```bash
docker compose up -d db redis
cd apps/api && uv sync && uv run alembic upgrade head && uv run uvicorn app.main:app --reload
cd apps/web && npm install && npm run dev
```

## Start a new project from it

1. Copy this folder, or push it to GitHub and mark the repository as a template.
2. Rename it: `name` in `compose.yaml` and the package names in `apps/web/package.json` and `apps/api/pyproject.toml`.
3. Give it a world: run `/world` in Claude Code with a sentence about the project, or fill in `WORLD.md` and re-skin `apps/web/src/styles/world.css` by hand.
4. Replace the demo page and the sample `Entry` resource with the real thing.

## What's inside

- `apps/web`: Astro 7. Pages are static by default; the notes list is a server island that reads from the API on each visit. The immersion layer is a handful of components and one small script, `src/scripts/immersion.ts`.
- `apps/api`: FastAPI with async SQLAlchemy and Alembic, a Redis cache that keeps working if Redis goes down, a health check, and pgvector helpers in `app/vector.py` for when they're needed.
- `CLAUDE.md`: the canon and the conventions, loaded into every Claude Code session in this repo.
- `WORLD.md`: the world bible for the project.

## Commands

Run `make` to list them: `up`, `down`, `logs`, `migrate`, `revision`, `test`, `test-integration`, `lint`, `check`, `contrast`.

## Every project, not just this one

`CLAUDE.md` applies inside this repo. To have Claude Code follow the canon in every repo on your machine, copy `docs/global-CLAUDE.md` to `~/.claude/CLAUDE.md`.
