"""Fast tests that need neither Postgres nor Redis."""

import pytest
from fastapi.testclient import TestClient
from redis.exceptions import ConnectionError as RedisConnectionError
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app import cache
from app.main import app
from app.vector import Embedded, nearest_query


def test_routes_are_registered() -> None:
    paths = TestClient(app).get("/openapi.json").json()["paths"]
    assert {"/health", "/entries"} <= paths.keys()


def test_entries_reject_an_empty_title() -> None:
    assert TestClient(app).post("/entries", json={"title": ""}).status_code == 422


@pytest.mark.anyio
async def test_cache_fails_open(monkeypatch: pytest.MonkeyPatch) -> None:
    async def unreachable(*_: object, **__: object) -> None:
        raise RedisConnectionError("redis is down")

    monkeypatch.setattr(cache.redis, "get", unreachable)

    async def produce() -> list[int]:
        return [1, 2, 3]

    assert await cache.remember("anything", ttl=5, produce=produce) == [1, 2, 3]


def test_nearest_query_orders_by_cosine_distance() -> None:
    class Base(DeclarativeBase):
        pass

    class Doc(Embedded, Base):
        __tablename__ = "docs"
        id: Mapped[int] = mapped_column(primary_key=True)

    sql = str(nearest_query(Doc, [0.1, 0.2, 0.3], k=3).compile(dialect=postgresql.dialect()))
    assert "<=>" in sql
    assert "LIMIT" in sql
