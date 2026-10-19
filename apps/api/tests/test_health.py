
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_includes_request_id() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")


def test_request_id_is_unique_for_each_request() -> None:
    with TestClient(app) as client:
        first_response = client.get("/health")
        second_response = client.get("/health")

    first_id = first_response.headers["X-Request-ID"]
    second_id = second_response.headers["X-Request-ID"]

    assert first_id != second_id


def test_supplied_request_id_is_returned() -> None:
    supplied_id = "test-request-123"

    with TestClient(app) as client:
        response = client.get(
            "/health",
            headers={"X-Request-ID": supplied_id},
        )

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == supplied_id




def test_readiness_returns_database_connected() -> None:
    with TestClient(app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "database": "connected",
    }



def test_readiness_returns_503_when_database_fails() -> None:
    with (
        patch("app.main.SessionLocal") as mock_session_local,
        TestClient(app) as client,
    ):
        mock_session = AsyncMock()
        mock_session.execute.side_effect = Exception("Database connection failed")
        mock_session_local.return_value.__aenter__.return_value = mock_session

        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database is unavailable"}
