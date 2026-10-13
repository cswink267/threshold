"""Redis: a cache that fails open.

If Redis is unreachable, reads fall through to the source and the app keeps
working, only slower. Cache values are JSON, so produce plain data
(`model_dump(mode="json")`), not ORM objects.
"""

import json
import logging
from collections.abc import Awaitable, Callable

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.config import settings

log = logging.getLogger(__name__)

redis = Redis.from_url(
    settings.redis_url,
    decode_responses=True,
    socket_connect_timeout=1,
    socket_timeout=1,
)


async def remember[T](key: str, ttl: int, produce: Callable[[], Awaitable[T]]) -> T:
    """Return the value cached at `key`, or produce it, cache it for `ttl` seconds and return it."""
    try:
        cached = await redis.get(key)
    except RedisError as exc:
        log.warning("cache read failed for %s: %s", key, exc)
        return await produce()
    if cached is not None:
        return json.loads(cached)

    value = await produce()
    try:
        await redis.set(key, json.dumps(value), ex=ttl)
    except RedisError as exc:
        log.warning("cache write failed for %s: %s", key, exc)
    return value


async def forget(*keys: str) -> None:
    """Drop cached keys after a write so the next read is fresh."""
    if not keys:
        return
    try:
        await redis.delete(*keys)
    except RedisError as exc:
        log.warning("cache delete failed for %s: %s", keys, exc)
