
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CBGDailyCapacity(Base):
    """Tracks daily storage and straw capacity for a CBG plant."""

    __tablename__ = "cbg_daily_capacity"
    __table_args__ = (
        UniqueConstraint("cbg_id", "capacity_date"),
        CheckConstraint("storage_max_tons >= 0"),
        CheckConstraint("current_stock_tons >= 0"),
        CheckConstraint("daily_consumption_tons >= 0"),
        CheckConstraint("buffer_target_tons >= 0"),
        CheckConstraint("reserved_today_tons >= 0"),
        CheckConstraint("current_stock_tons <= storage_max_tons"),
        CheckConstraint("buffer_target_tons <= storage_max_tons"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True,
        default=uuid.uuid4, server_default=func.gen_random_uuid(),
    )
    cbg_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cbgs.id"), nullable=False,
    )
    capacity_date: Mapped[date] = mapped_column(Date, nullable=False)
    storage_max_tons: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    current_stock_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3), nullable=False, default=0, server_default="0",
    )
    daily_consumption_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3), nullable=False, default=0, server_default="0",
    )
    buffer_target_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3), nullable=False, default=0, server_default="0",
    )
    reserved_today_tons: Mapped[Decimal] = mapped_column(
        Numeric(12, 3), nullable=False, default=0, server_default="0",
    )
    is_closed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=func.false(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(), onupdate=func.now(),
    )
