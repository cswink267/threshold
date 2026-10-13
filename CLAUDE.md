# CLAUDE.md

This is a Threshold project, built from the starter every site and app begins with.

## The canon

Every project uses this stack unless the user says otherwise:

- **Astro** for the site (`apps/web`)
- **FastAPI** for the API (`apps/api`)
- **Postgres** for data (SQLAlchemy 2.1 async + Alembic)
- **Redis** for caching, rate limits, sessions and queues
- **pgvector** only when the project needs embeddings or semantic search (see "Adding pgvector")

Every site is immersive, dynamic and rich. It should draw people in the way stepping into the deep, dark woods of a fantasy world does, and hold them there in amazement.

### "Deep woods" is figurative

It describes a feeling, not scenery. Never default to trees, forests, moss, fog, fireflies or green palettes; a project only gets those if its own subject calls for them. The feeling has five parts:

1. **Arrive somewhere.** Arrival is a threshold, not a landing. The first moment sets a mood and the ordinary web falls away.
2. **Its own world.** Each project's world comes from its subject: its own light, texture, type, motion and sound, with consistent internal logic. A grief-themed album, a mastering tool and a clothing store look nothing alike.
3. **Go deeper.** Layered space and unfolding content. There is always more further in.
4. **Follow your curiosity.** Each section leads to the next, and looking closer is rewarded.
5. **It answers you.** The world responds to the visitor's pointer, scroll and focus.

### The spell never hides the path

Immersion frames the content; it never replaces it.

- Navigation and the main action are visible from the first screen. Stores show products and prices on the first screen; a manifesto never stands between a visitor and what they came for.
- Body text meets WCAG AA contrast (4.5:1) once it's in view, and focus is always visible.
- `prefers-reduced-motion` gets a still version that's just as considered. Without JavaScript the page is complete.
- Sound is always opt-in. No scroll-jacking, no blocking intro screens, no autoplaying sound.
- Fast: static by default, JavaScript only where something moves or answers, LCP under 2.5 s on mobile.

### Motion

One orchestrated moment per page: the arrival. After that, motion only answers the visitor. Don't fade-and-slide every section into view; that reads as a template, not a world.

### Avoid the template look

Generic chrome breaks the spell. Unless a world calls for it, avoid: an all-caps tracked label above every heading; one word of a headline set in italic or a different color; 01/02/03 numbering on things that aren't a sequence; rows of identical rounded cards with the same soft shadow; meta strings joined with middle dots; arrows appended to button text. Choose typefaces for the world, never the usual defaults.

## Repo map

```
apps/web                    Astro 7. Static by default; @astrojs/node renders the on-demand parts
  src/styles/world.css      the world: every color, font, tempo and atmosphere token
  src/styles/base.css       the shared grammar (cascade layers, so component styles win)
  src/layouts/World.astro   page shell: fonts, atmosphere, crest, immersion script, theme-color
  src/components/           Atmosphere, Crest, Threshold, Passage, Whisper, Notes (server island)
  src/scripts/immersion.ts  the light, illumination and depth (read its header)
  src/lib/api.ts            server-side calls to FastAPI
  scripts/contrast.mjs      contrast check for world.css
apps/api                    FastAPI
  app/config.py             settings from env      app/db.py      engine, Base, SessionDep
  app/cache.py              Redis, fails open      app/vector.py  pgvector helpers
  app/routes/               one router per resource
  migrations/               Alembic
WORLD.md                    the world bible for this project
compose.yaml                Postgres (pgvector image), Redis, API, web
```

## Commands

```
make up                   everything in Docker: site :4321, API :8000 (/docs)
make test                 API unit tests (no services needed)
make test-integration     API tests against the running Postgres and Redis
make lint                 ruff
make check                astro check + build
make contrast             contrast of the world's colors
make revision m="..."     new migration from model changes; make migrate applies it
```

## Conventions

API
- Async everywhere; take a session with `session: SessionDep`.
- Models live in (or are imported into) `app/models.py` so Alembic sees them. After model changes: `make revision m="..."`, read the generated file, then `make migrate`. Never edit a migration that has already run.
- Cache hot reads with `cache.remember(key, ttl, produce)` and call `cache.forget(key)` after writes. Cache JSON data (`model_dump(mode="json")`), not ORM objects.
- Configuration only through `app/config.py` and environment variables; no secrets in code.
- Unit tests run without services; tests that need Postgres and Redis skip unless `INTEGRATION=1`.

Web
- Components read tokens from `world.css`. Never hardcode colors, fonts or durations.
- Live data renders on the server: a server island (`server:defer`) or a page with `export const prerender = false`, calling FastAPI through `src/lib/api.ts`. Browser code uses `PUBLIC_API_URL` from `astro:env/client`.
- Immersion hooks: `data-lit` brightens near the middle of the view; `data-depth="0.1"` to `"0.6"` drifts with scroll and pointer (it sets `transform` inline, so wrap anything that animates its own transform); `data-light` lights type where the visitor's light falls; `--deep` on `<html>` runs from 0 to 1 down the page.
- Astro 7 notes: `compressHTML: true` is deliberate (the 'jsx' default glues words together at line breaks); unclosed tags fail the build; `src/fetch.ts` is reserved; import zod from `astro/zod`.
- Fonts are self-hosted Fontsource packages imported in `World.astro`.

## Defining a project's world

Run `/world` with a sentence about the project, or follow `.claude/skills/world/SKILL.md` by hand: write WORLD.md from the subject, re-skin `world.css` and the theme-color, check contrast, then replace the demo page and the sample `Entry` resource.

## Adding pgvector (only when needed)

1. New migration with `op.execute("CREATE EXTENSION IF NOT EXISTS vector")`. In compose the app's database user is a superuser; managed Postgres may need an admin to enable the extension.
2. Add the `Embedded` mixin from `app/vector.py` to a model and run `make revision`. The migration template already imports the vector types.
3. Index it in that migration: `op.execute("CREATE INDEX ix_<table>_embedding ON <table> USING hnsw (embedding vector_cosine_ops)")`.
4. Query with `await nearest(session, Model, query_vector, k)`, and set `EMBEDDING_DIM` to the embedding model's size.
