import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CropType(str, Enum):
    PADDY_STRAW = "PADDY_STRAW"
    WHEAT_STRAW = "WHEAT_STRAW"
    OTHER = "OTHER"


class CBGPrice(Base):
    """Stores current and historical prices for crops at a CBG plant."""

    __tablename__ = "cbg_prices"

    __table_args__ = (
        CheckConstraint("price_per_ton >= 0"),
        CheckConstraint(
            "effective_to IS NULL OR effective_to > effective_from"
        ),
        Index(
            "uq_cbg_prices_current",
            "cbg_id",
            "crop",
            unique=True,
            postgresql_where=text("effective_to IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    cbg_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cbgs.id"),
        nullable=False,
    )

    crop: Mapped[CropType] = mapped_column(
        ENUM(CropType, name="crop_type", create_type=False),
        nullable=False,
    )

    price_per_ton: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    effective_to: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    set_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
