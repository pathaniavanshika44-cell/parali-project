"""add email and password_hash to users

Revision ID: 0002
Revises: bc00f7130ca4

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: str | None = "bc00f7130ca4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email", sa.String(254), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.Text(), nullable=True))
    op.create_index(
        "users_email_lower_key",
        "users",
        [sa.text("lower(email)")],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("users_email_lower_key", table_name="users")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "email")