"""Is the world awake? Checks Postgres and Redis; answers 503 if either is down."""

from fastapi import APIRouter, Response
from sqlalchemy import text

from app import cache
from app.db import SessionDep

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(session: SessionDep, response: Response) -> dict[str, str]:
    checks: dict[str, str] = {}
    try:
        await session.execute(text("SELECT 1"))
        checks["postgres"] = "ok"
    except Exception:
        checks["postgres"] = "down"
    try:
        await cache.redis.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "down"

    healthy = all(state == "ok" for state in checks.values())
    if not healthy:
        response.status_code = 503
    return {"status": "ok" if healthy else "degraded", **checks}
