-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- Enforce tenant isolation at the database layer
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invite_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "login_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_resets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "two_factor_challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_accounts" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUPERADMIN POLICIES
-- SuperAdmin sees: all tenants, all users, all payments, all audit logs
-- SuperAdmin cannot see: client profiles, client-specific data
-- ============================================================================

-- USERS: SuperAdmin can see all tenant-admin users, not clients
CREATE POLICY "superadmin_users_all" ON "users"
  FOR SELECT
  USING (
    current_setting('app.user_role') = 'SUPERADMIN'
    AND "role" != 'CLIENT'
  );

-- TENANTS: SuperAdmin can see and manage all
CREATE POLICY "superadmin_tenants_all" ON "tenants"
  FOR ALL
  USING (current_setting('app.user_role') = 'SUPERADMIN')
  WITH CHECK (current_setting('app.user_role') = 'SUPERADMIN');

-- PAYMENTS: SuperAdmin can see all
CREATE POLICY "superadmin_payments_all" ON "payments"
  FOR SELECT
  USING (current_setting('app.user_role') = 'SUPERADMIN');

-- AUDIT_LOGS: SuperAdmin can see all (except client-level data)
CREATE POLICY "superadmin_audit_all" ON "audit_logs"
  FOR SELECT
  USING (
    current_setting('app.user_role') = 'SUPERADMIN'
    AND "entity" NOT IN ('clientprofile')
  );

-- LOGIN_ATTEMPTS: SuperAdmin can see all tenant-related attempts
CREATE POLICY "superadmin_login_attempts_all" ON "login_attempts"
  FOR SELECT
  USING (
    current_setting('app.user_role') = 'SUPERADMIN'
    AND EXISTS (
      SELECT 1 FROM "users" u 
      WHERE u."id" = "login_attempts"."userId" 
      AND u."role" = 'TENANT'
    )
  );

-- ============================================================================
-- TENANT POLICIES
-- Tenant sees: their own profile, their users, their clients, their data
-- Tenant cannot see: other tenants, other tenant data
-- ============================================================================

-- USERS: Tenant sees their own users and clients
CREATE POLICY "tenant_users_own" ON "users"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- USERS: Tenant can update their own profile
CREATE POLICY "tenant_users_update_self" ON "users"
  FOR UPDATE
  USING (
    "id" = current_setting('app.user_id')::text
    AND "tenantId" = current_setting('app.tenant_id')::text
  )
  WITH CHECK (
    "id" = current_setting('app.user_id')::text
    AND "tenantId" = current_setting('app.tenant_id')::text
  );

-- TENANTS: Tenant can only see their own tenant
CREATE POLICY "tenant_tenants_own" ON "tenants"
  FOR SELECT
  USING (
    "id" = current_setting('app.tenant_id')::text
  );

-- TENANTS: Tenant can update their own profile
CREATE POLICY "tenant_tenants_update_self" ON "tenants"
  FOR UPDATE
  USING (
    "id" = current_setting('app.tenant_id')::text
  )
  WITH CHECK (
    "id" = current_setting('app.tenant_id')::text
  );

-- CLIENT_PROFILES: Tenant can see all their clients
CREATE POLICY "tenant_clients_own" ON "client_profiles"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- CLIENT_PROFILES: Tenant can create clients
CREATE POLICY "tenant_clients_create" ON "client_profiles"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- CLIENT_PROFILES: Tenant can update their clients
CREATE POLICY "tenant_clients_update" ON "client_profiles"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- INVITE_CODES: Tenant can see their invite codes
CREATE POLICY "tenant_invites_own" ON "invite_codes"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- INVITE_CODES: Tenant can create invites
CREATE POLICY "tenant_invites_create" ON "invite_codes"
  FOR INSERT
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- INVITE_CODES: Tenant can revoke their invites
CREATE POLICY "tenant_invites_update" ON "invite_codes"
  FOR UPDATE
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  )
  WITH CHECK (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- PAYMENTS: Tenant can see their payments
CREATE POLICY "tenant_payments_own" ON "payments"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
  );

-- AUDIT_LOGS: Tenant can see their audit logs (no client data)
CREATE POLICY "tenant_audit_own" ON "audit_logs"
  FOR SELECT
  USING (
    "tenantId" = current_setting('app.tenant_id')::text
    AND "entity" NOT IN ('clientprofile')
  );

-- SESSIONS: User can only see their own sessions
CREATE POLICY "tenant_sessions_own" ON "sessions"
  FOR SELECT
  USING (
    "userId" = current_setting('app.user_id')::text
  );

-- DEVICES: User can only see their own devices
CREATE POLICY "tenant_devices_own" ON "devices"
  FOR SELECT
  USING (
    "userId" = current_setting('app.user_id')::text
  );

-- LOGIN_ATTEMPTS: Tenant sees their own users' attempts
CREATE POLICY "tenant_login_attempts_own" ON "login_attempts"
  FOR SELECT
  USING (
    "userId" IN (
      SELECT "id" FROM "users" 
      WHERE "tenantId" = current_setting('app.tenant_id')::text
    )
  );

-- ============================================================================
-- CLIENT POLICIES
-- Client sees: only their own profile, only their own workspace
-- ============================================================================

-- USERS: Client can only see themselves
CREATE POLICY "client_users_self" ON "users"
  FOR SELECT
  USING (
    "id" = current_setting('app.user_id')::text
  );

-- USERS: Client can update their own profile
CREATE POLICY "client_users_update_self" ON "users"
  FOR UPDATE
  USING (
    "id" = current_setting('app.user_id')::text
  )
  WITH CHECK (
    "id" = current_setting('app.user_id')::text
  );

-- CLIENT_PROFILES: Client can only see their own profile
CREATE POLICY "client_profiles_own" ON "client_profiles"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = current_setting('app.user_id')::text
      AND "users"."clientProfileId" = "client_profiles"."id"
    )
  );

-- CLIENT_PROFILES: Client can update their own profile
CREATE POLICY "client_profiles_update_own" ON "client_profiles"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = current_setting('app.user_id')::text
      AND "users"."clientProfileId" = "client_profiles"."id"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."id" = current_setting('app.user_id')::text
      AND "users"."clientProfileId" = "client_profiles"."id"
    )
  );

-- SESSIONS: Client can only see their own sessions
CREATE POLICY "client_sessions_own" ON "sessions"
  FOR SELECT
  USING (
    "userId" = current_setting('app.user_id')::text
  );

-- DEVICES: Client can only see their own devices
CREATE POLICY "client_devices_own" ON "devices"
  FOR SELECT
  USING (
    "userId" = current_setting('app.user_id')::text
  );

-- ============================================================================
-- PUBLIC (Unauthenticated) POLICIES
-- Only for sign-up/login flows
-- ============================================================================

-- USERS: Public can insert new users (sign-up)
CREATE POLICY "public_users_signup" ON "users"
  FOR INSERT
  WITH CHECK (
    "id" = current_setting('app.user_id')::text
    AND "accountStatus" = 'PENDING'
  );

-- INVITE_CODES: Public can check invite code validity
CREATE POLICY "public_invites_check" ON "invite_codes"
  FOR SELECT
  USING (
    "isUsed" = false
    AND "isRevoked" = false
    AND "expiresAt" > NOW()
  );

-- LOGIN_ATTEMPTS: Anyone can insert login attempts
CREATE POLICY "public_login_attempts_insert" ON "login_attempts"
  FOR INSERT
  WITH CHECK (true);
