"""baseline from 001_schema.sql

Revision ID: bc00f7130ca4
Revises: 
Create Date: 2026-10-26 13:26:48.459915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'bc00f7130ca4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
