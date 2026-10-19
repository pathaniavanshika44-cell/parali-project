
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.core.logging import configure_logging
from app.core.request_id import RequestIDMiddleware
from app.db.session import SessionLocal, close_database_connection

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown."""
    yield
    await close_database_connection()


app = FastAPI(
    title="Parali-to-CBG Marketplace API",
    description="Backend API for connecting farmers with CBG plants.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(RequestIDMiddleware)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}




@app.get("/health/ready", tags=["Health"])
async def readiness_check() -> dict[str, str]:
    try:
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from None

    return {"status": "ready", "database": "connected"}
