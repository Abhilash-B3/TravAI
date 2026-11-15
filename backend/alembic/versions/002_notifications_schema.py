"""create notifications table

Revision ID: 002_notifications
Revises: 001_core_identity
Create Date: 2026-09-08 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_notifications'
down_revision = '001_core_identity'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create Enums
    notification_category_enum = postgresql.ENUM(
        'SECURITY', 'SYSTEM', 'TENANCY', 'PMS', 'COMMERCE', 'ALERT',
        name='notification_category_enum',
        create_type=False,
    )
    notification_category_enum.create(op.get_bind(), checkfirst=True)

    notification_priority_enum = postgresql.ENUM(
        'LOW', 'NORMAL', 'HIGH', 'URGENT',
        name='notification_priority_enum',
        create_type=False,
    )
    notification_priority_enum.create(op.get_bind(), checkfirst=True)

    notification_status_enum = postgresql.ENUM(
        'PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'ARCHIVED', 'FAILED', 'CANCELLED',
        name='notification_status_enum',
        create_type=False,
    )
    notification_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Create Table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('category', notification_category_enum, nullable=False, server_default='SYSTEM'),
        sa.Column('priority', notification_priority_enum, nullable=False, server_default='NORMAL'),
        sa.Column('status', notification_status_enum, nullable=False, server_default='DELIVERED'),
        sa.Column('action_url', sa.String(512), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        schema='core_identity',
    )

    op.create_index(
        'ix_notifications_user_status',
        'notifications',
        ['user_id', 'status'],
        schema='core_identity',
    )
    op.create_index(
        'ix_notifications_org_prop',
        'notifications',
        ['organization_id', 'property_id'],
        schema='core_identity',
    )


def downgrade() -> None:
    op.drop_table('notifications', schema='core_identity')
    op.execute('DROP TYPE IF EXISTS notification_status_enum CASCADE;')
    op.execute('DROP TYPE IF EXISTS notification_priority_enum CASCADE;')
    op.execute('DROP TYPE IF EXISTS notification_category_enum CASCADE;')
