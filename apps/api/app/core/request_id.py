
import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a request ID and log each HTTP request."""

    async def dispatch(
    self,
    request: Request,
    call_next: RequestResponseEndpoint,
) -> Response:
        supplied_id = request.headers.get("X-Request-ID")
        request_id = supplied_id or str(uuid.uuid4())

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id

            logger.info(
                "http_request_completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round((time.perf_counter() - start_time) * 1000, 2),
            )

            return response
        except Exception:
            logger.exception(
                "http_request_failed",
                method=request.method,
                path=request.url.path,
            )
            raise
        finally:
            structlog.contextvars.clear_contextvars()
