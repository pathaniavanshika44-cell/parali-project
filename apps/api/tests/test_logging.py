
import json

import structlog

from app.core.logging import configure_logging


def test_structured_logging_outputs_json(capsys) -> None:
    configure_logging()

    logger = structlog.get_logger("test")
    logger.info("logging_test_event", component="api")

    captured = capsys.readouterr()
    log_line = captured.out.strip().splitlines()[-1]
    log_data = json.loads(log_line)

    assert log_data["event"] == "logging_test_event"
    assert log_data["component"] == "api"
    assert log_data["level"] == "info"
    assert "timestamp" in log_data


def test_request_id_is_included_in_structured_logs(capsys) -> None:
    configure_logging()

    request_id = "test-request-456"

    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=request_id)

    try:
        logger = structlog.get_logger("test")
        logger.info("request_context_test")

        captured = capsys.readouterr()
        log_data = json.loads(captured.out.strip().splitlines()[-1])

        assert log_data["request_id"] == request_id
        assert log_data["event"] == "request_context_test"
    finally:
        structlog.contextvars.clear_contextvars()
