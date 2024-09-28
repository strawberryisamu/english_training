"""create refresh

Revision ID: a413f6dcfb4f
Revises: c0a2ed502f86
Create Date: 2024-09-28 06:56:54.134574

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a413f6dcfb4f'
down_revision: Union[str, None] = 'c0a2ed502f86'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
