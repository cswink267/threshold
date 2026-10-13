"""End to end against real Postgres and Redis.

Run with the data services up and migrated:  make test-integration
"""

import os

import pytest
from fastapi.testclient import TestClient

from app.main import app

pytestmark = pytest.mark.skipif(
    os.getenv("INTEGRATION") != "1", reason="set INTEGRATION=1 with Postgres and Redis running"
)


def test_health_and_entries_round_trip() -> None:
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "ok", "postgres": "ok", "redis": "ok"}

        created = client.post("/entries", json={"title": "First light", "body": "Hello."})
        assert created.status_code == 201
        entry = created.json()
        assert entry["id"] and entry["created_at"]

        listed = client.get("/entries").json()
        assert listed[0]["id"] == entry["id"]
        assert client.get("/entries").json() == listed  # second read is served from Redis
