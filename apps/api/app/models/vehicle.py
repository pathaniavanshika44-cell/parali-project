
import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Vehicle(Base):
    """A vehicle available for transporting agricultural residue."""

    __tablename__ = "vehicles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    transporter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transporters.user_id"),
        nullable=False,
    )

    vehicle_class: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    registration_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        unique=True,
    )

    capacity_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3),
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=func.true(),
    )
