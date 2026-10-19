
import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from geoalchemy2 import Geography
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.price import CropType


class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    WAITLISTED = "WAITLISTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"
    EXPIRED = "EXPIRED"


class Booking(Base):
    """Represents a farmer's request to sell crop residue to a CBG plant."""

    __tablename__ = "bookings"

    __table_args__ = (
        CheckConstraint(
            "quantity_tons > 0",
            name="ck_bookings_quantity_positive",
        ),
        CheckConstraint(
            "reserved_tons >= 0",
            name="ck_bookings_reserved_nonnegative",
        ),
        CheckConstraint(
            "locked_price_per_ton IS NULL OR locked_price_per_ton >= 0",
            name="ck_bookings_locked_price_nonnegative",
        ),
        CheckConstraint(
            "actual_weight_tons IS NULL OR actual_weight_tons >= 0",
            name="ck_bookings_actual_weight_nonnegative",
        ),
        CheckConstraint(
            "total_amount IS NULL OR total_amount >= 0",
            name="ck_bookings_total_amount_nonnegative",
        ),
        Index(
            "uq_farmer_active_booking_day",
            "farmer_id",
            "preferred_date",
            unique=True,
            postgresql_where=text(
                "status IN ('REQUESTED', 'ACCEPTED', 'WAITLISTED')"
            ),
        ),
        Index(
            "idx_bookings_cbg_date_status",
            "cbg_id",
            "preferred_date",
            "status",
        ),
        Index(
            "idx_bookings_farmer_created",
            "farmer_id",
            text("created_at DESC"),
        ),
        Index(
            "idx_bookings_pickup_location",
            "pickup_location",
            postgresql_using="gist",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    booking_code: Mapped[str | None] = mapped_column(
        String(32),
        unique=True,
        nullable=True,
    )

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("farmers.user_id"),
        nullable=False,
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

    quantity_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3),
        nullable=False,
    )

    pickup_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Stored as PostGIS GEOGRAPHY(POINT, 4326).
    pickup_location: Mapped[object | None] = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326,
            spatial_index=False,
        ),
        nullable=True,
    )

    preferred_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        ENUM(BookingStatus, name="booking_status", create_type=False),
        nullable=False,
        default=BookingStatus.REQUESTED,
        server_default="REQUESTED",
    )

    reason_code: Mapped[str | None] = mapped_column(
        String(60),
        nullable=True,
    )

    reserved_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3),
        nullable=False,
        default=Decimal("0"),
        server_default="0",
    )

    locked_price_per_ton: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    actual_weight_tons: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 3),
        nullable=True,
    )

    total_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
