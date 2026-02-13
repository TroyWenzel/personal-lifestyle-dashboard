"""Add content_type and description fields to SavedItem

Revision ID: 72477595f86c
Revises: b74f515f167f
Create Date: 2026-02-10 21:47:42.102049

"""
from alembic import op
import sqlalchemy as sa


revision = '72477595f86c'
down_revision = 'b74f515f167f'
branch_labels = None
depends_on = None


def upgrade():
    # Add columns as nullable first
    op.add_column('saved_items', sa.Column('content_type', sa.String(length=50), nullable=True))
    op.add_column('saved_items', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('saved_items', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Use connection for raw SQL
    conn = op.get_bind()
    conn.execute("UPDATE saved_items SET content_type = 'item' WHERE content_type IS NULL")
    conn.execute("UPDATE saved_items SET updated_at = created_at WHERE updated_at IS NULL")
    
    # Now make content_type NOT NULL
    op.alter_column('saved_items', 'content_type', nullable=False)


def downgrade():
    op.drop_column('saved_items', 'updated_at')
    op.drop_column('saved_items', 'description')
    op.drop_column('saved_items', 'content_type')