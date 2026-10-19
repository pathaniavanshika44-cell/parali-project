
import uuid
from datetime import datetime
from decimal import Decimal

from geoalchemy2 import Geography
from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CBG(Base):
    """Represents a Compressed Biogas plant."""

    __tablename__ = "cbgs"
    __table_args__ = (
        Index(
            "idx_cbgs_location",
            "location",
            postgresql_using="gist",
        ),
        Index(
            "uq_cbgs_source_plant_id",
            "source_plant_id",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[object] = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=False,
        ),
        nullable=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=func.false(),
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=func.true(),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    source_plant_id: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    entity_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )
    district: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )
    feedstock_capacity_tons_per_day: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 3),
        nullable=True,
    )
