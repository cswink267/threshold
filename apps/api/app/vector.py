"""pgvector, for when a project needs it.

The database image already ships the extension, but nothing uses it until a
project calls for embeddings or semantic search. To turn it on:

1. In a new migration:  op.execute("CREATE EXTENSION IF NOT EXISTS vector")
2. Add `Embedded` to a model, then `make revision m="add embeddings"`.
3. Index it in that migration:
   op.execute("CREATE INDEX ix_docs_embedding ON docs USING hnsw (embedding vector_cosine_ops)")
4. Query with `await nearest(session, Doc, query_vector)`.

Set EMBEDDING_DIM to match whichever embedding model the project uses.
"""

from typing import Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.config import settings


class Embedded:
    """Mixin: gives a model an `embedding` column sized by EMBEDDING_DIM."""

    embedding: Mapped[Any] = mapped_column(Vector(settings.embedding_dim), nullable=True)


def nearest_query(model: type[Any], query: list[float], k: int = 10) -> Select[Any]:
    """The `k` rows closest to `query` by cosine distance."""
    return select(model).order_by(model.embedding.cosine_distance(query)).limit(k)


async def nearest[M](
    session: AsyncSession, model: type[M], query: list[float], k: int = 10
) -> list[M]:
    return list(await session.scalars(nearest_query(model, query, k)))
