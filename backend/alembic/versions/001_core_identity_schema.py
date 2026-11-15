"""001_core_identity_schema

Revision ID: 001_core_identity
Revises: 
Create Date: 2026-09-08 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_core_identity'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create schema
    op.execute("CREATE SCHEMA IF NOT EXISTS core_identity;")

    # 2. Create Enums
    account_status_enum = postgresql.ENUM(
        'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'DISABLED',
        name='account_status_enum', schema='core_identity'
    )
    account_status_enum.create(op.get_bind(), checkfirst=True)

    scope_type_enum = postgresql.ENUM(
        'PLATFORM', 'ORGANIZATION', 'BRAND', 'PROPERTY', 'CORPORATE', 'SELF',
        name='scope_type_enum', schema='core_identity'
    )
    scope_type_enum.create(op.get_bind(), checkfirst=True)

    # 3. Organizations
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=128), nullable=False, unique=True),
        sa.Column('code', sa.String(length=64), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 4. Brands
    op.create_table(
        'brands',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.UniqueConstraint('organization_id', 'code', name='uq_brand_org_code'),
        schema='core_identity'
    )

    # 5. Properties
    op.create_table(
        'properties',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('brand_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.brands.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=32), nullable=False),
        sa.Column('timezone', sa.String(length=64), server_default='UTC', nullable=False),
        sa.Column('base_currency', sa.String(length=3), server_default='USD', nullable=False),
        sa.Column('status', sa.String(length=32), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.UniqueConstraint('organization_id', 'code', name='uq_property_org_code'),
        schema='core_identity'
    )

    # 6. Corporate Accounts
    op.create_table(
        'corporate_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.organizations.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=32), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.UniqueConstraint('organization_id', 'code', name='uq_corp_org_code'),
        schema='core_identity'
    )

    # 7. Departments
    op.create_table(
        'departments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('corporate_account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.corporate_accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.UniqueConstraint('corporate_account_id', 'code', name='uq_dept_corp_code'),
        schema='core_identity'
    )

    # 8. Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=128), nullable=False),
        sa.Column('last_name', sa.String(length=128), nullable=False),
        sa.Column('account_status', account_status_enum, server_default='PENDING_VERIFICATION', nullable=False),
        sa.Column('is_superadmin', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('failed_login_attempts', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 9. User Sessions
    op.create_table(
        'user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('refresh_token_hash', sa.String(length=255), nullable=False),
        sa.Column('family_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('user_agent', sa.String(length=512), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('revoked_reason', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 10. User Role Assignments
    op.create_table(
        'user_role_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role_code', sa.String(length=64), nullable=False),
        sa.Column('scope_type', scope_type_enum, nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.organizations.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('brand_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.brands.id', ondelete='CASCADE'), nullable=True),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.properties.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('corporate_account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.corporate_accounts.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('department_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.departments.id', ondelete='CASCADE'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 11. Password Reset Tokens
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('token_hash', sa.String(length=255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 12. Email Verification Tokens
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('core_identity.users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('token_hash', sa.String(length=255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )

    # 13. Security Audit Logs
    op.create_table(
        'security_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('event_type', sa.String(length=64), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
        sa.Column('user_agent', sa.String(length=512), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        schema='core_identity'
    )


def downgrade() -> None:
    op.drop_table('security_audit_logs', schema='core_identity')
    op.drop_table('email_verification_tokens', schema='core_identity')
    op.drop_table('password_reset_tokens', schema='core_identity')
    op.drop_table('user_role_assignments', schema='core_identity')
    op.drop_table('user_sessions', schema='core_identity')
    op.drop_table('users', schema='core_identity')
    op.drop_table('departments', schema='core_identity')
    op.drop_table('corporate_accounts', schema='core_identity')
    op.drop_table('properties', schema='core_identity')
    op.drop_table('brands', schema='core_identity')
    op.drop_table('organizations', schema='core_identity')
    op.execute("DROP SCHEMA IF EXISTS core_identity CASCADE;")
