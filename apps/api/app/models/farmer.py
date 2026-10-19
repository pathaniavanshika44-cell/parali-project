
import uuid
from datetime import datetime
from decimal import Decimal

from geoalchemy2 import Geography
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Farmer(Base):
    """Farmer-specific profile and pickup information."""

    __tablename__ = "farmers"

    __table_args__ = (
        CheckConstraint(
            "land_area_acres IS NULL OR land_area_acres >= 0",
            name="ck_farmers_land_area_nonnegative",
        ),
        CheckConstraint(
            "strikes >= 0",
            name="ck_farmers_strikes_nonnegative",
        ),
        Index(
            "idx_farmers_pickup_location",
            "pickup_location",
            postgresql_using="gist",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        primary_key=True,
    )

    village: Mapped[str | None] = mapped_column(String(120))

    land_area_acres: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2)
    )

    pickup_address: Mapped[str | None] = mapped_column(Text)

    pickup_location: Mapped[object | None] = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=False,
        )
    )

    strikes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    suspended_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
