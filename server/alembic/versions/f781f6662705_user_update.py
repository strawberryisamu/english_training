"""user update

Revision ID: f781f6662705
Revises: a413f6dcfb4f
Create Date: 2024-09-28 10:59:54.514481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f781f6662705'
down_revision: Union[str, None] = 'a413f6dcfb4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
