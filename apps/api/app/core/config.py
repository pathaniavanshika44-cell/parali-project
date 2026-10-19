from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[4]
class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "parali-to-cbg-marketplace"
    app_env: Literal["development", "testing", "production"] = "development"
    timezone: str = "Asia/Kolkata"

    database_url: str = Field(
        default="postgresql+asyncpg://parali_app:change_me_local_only@localhost:5432/parali_marketplace",
        repr=False,
    )
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        repr=False,
    )

    api_host: str = "127.0.0.1"
    api_port: int = Field(default=8000, ge=1, le=65535)

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()
