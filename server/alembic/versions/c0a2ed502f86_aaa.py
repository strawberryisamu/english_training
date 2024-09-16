"""aaa

Revision ID: c0a2ed502f86
Revises: c3c4297d6d58
Create Date: 2024-09-16 16:46:01.699598

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c0a2ed502f86'
down_revision: Union[str, None] = 'c3c4297d6d58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
