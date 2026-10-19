
import uuid

from sqlalchemy import Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Transporter(Base):
    """A transport provider registered on the marketplace."""

    __tablename__ = "transporters"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        primary_key=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.false(),
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.true(),
    )
