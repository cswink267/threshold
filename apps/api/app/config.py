"""Settings come from the environment, or from the repo-root .env when running locally."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")

    database_url: str = "postgresql+asyncpg://threshold:threshold@localhost:5432/threshold"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: str = "http://localhost:4321"
    embedding_dim: int = 384

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
