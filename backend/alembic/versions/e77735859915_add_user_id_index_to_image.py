"""add_user_id_index_to_image

Revision ID: e77735859915
Revises: 2e25402a9f60
Create Date: 2026-04-20 23:27:14.439795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e77735859915'
down_revision: Union[str, Sequence[str], None] = '2e25402a9f60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(op.f('ix_image_user_id'), 'image', ['user_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_image_user_id'), table_name='image')
    # ### end Alembic commands ###
