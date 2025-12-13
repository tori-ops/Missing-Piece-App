# 🏗️ Missing Piece App - Architecture Reference

Complete architecture documentation for the Missing Piece wedding planning SaaS.

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Browser)                    │
│  ├─ SUPERADMIN Dashboard (Tenant List, Analytics)           │
│  ├─ TENANT Dashboard (Client Management, Subscriptions)     │
│  └─ CLIENT Workspace (Wedding Planning)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            NEXT.JS API LAYER (App Router)                   │
│  ├─ /api/auth/* (NextAuth routes)                           │
│  ├─ /api/superadmin/* (Tenant CRUD)                         │
│  ├─ /api/tenant/* (Client & Invite Code CRUD)              │
│  ├─ /api/client/* (Wedding planning data)                   │
│  └─ /api/account/* (Profile, password, 2FA)                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              ORM LAYER (Prisma Client)                      │
│  ├─ Connection pooling                                      │
│  ├─ Query generation                                        │
│  └─ Type safety (TypeScript)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│        DATABASE LAYER (Supabase PostgreSQL 16)              │
│  ├─ Row-Level Security (RLS) policies (30+)                │
│  ├─ 23 tables with proper relationships                     │
│  ├─ Indexes on frequently queried columns                   │
│  └─ Audit logging built-in                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Access Control

### SUPERADMIN
**Purpose**: Platform administrator, sees all data except client PII.

**Access**:
- ✅ View all tenants (list, status, metrics)
- ✅ Create new tenants (with email verification)
- ✅ Approve branched tenant accounts (second admin for same tenant)
- ✅ View all payments and revenue
- ✅ View audit logs (non-client events)
- ✅ Manage user accounts (reset passwords, lock accounts)
- ❌ Cannot see client couple names or wedding details
- ❌ Cannot see client email addresses (only tenant knows these)

**RLS Enforcement**: 
```sql
-- SuperAdmin can see all users EXCEPT CLIENT role
SELECT * FROM users 
WHERE current_setting('app.user_role') = 'SUPERADMIN' 
AND role != 'CLIENT'
```

---

### TENANT
**Purpose**: Wedding planning business operator, manages own clients.

**Access**:
- ✅ View/edit own business profile
- ✅ Create new client accounts (with invite codes)
- ✅ View all own client profiles
- ✅ View own users (tenant + admin)
- ✅ View own payments and subscription status
- ✅ View own audit logs
- ✅ Manage branched tenant accounts (request second admin)
- ❌ Cannot see other tenants' data
- ❌ Cannot see SuperAdmin-level analytics

**RLS Enforcement**:
```sql
-- Tenant can only see data for their own tenantId
SELECT * FROM clients 
WHERE tenantId = current_setting('app.tenant_id')::uuid
```

---

### CLIENT
**Purpose**: Couple getting married, plans wedding with their partner.

**Access**:
- ✅ View/edit own user profile
- ✅ View/edit own client profile (shared with partner)
- ✅ View own sessions and devices
- ✅ Change own password
- ✅ Enable/disable 2FA
- ❌ Cannot see other clients' data
- ❌ Cannot see tenant data (except who their wedding planner is)
- ❌ Cannot see subscription or payment data

**RLS Enforcement**:
```sql
-- Client can only see own user and assigned client profiles
SELECT * FROM client_profiles 
WHERE id IN (
  SELECT clientProfileId FROM user_client_profiles 
  WHERE userId = current_setting('app.user_id')::uuid
)
```

---

## 🗂️ Database Schema (23 Models)

### Core Identity Models

#### User
Represents a single login identity (email + password).
```prisma
model User {
  id                      String
  email                   String @unique
  firstName               String // Personalized greeting
  lastName                String // Personalized greeting
  role                    UserRole // SUPERADMIN | TENANT | CLIENT
  tenantId                String? // Null for SUPERADMIN
  accountStatus           AccountStatus // ACTIVE | LOCKED | INACTIVE | ARCHIVED
  
  // Auth fields
  passwordHash            String?
  emailVerified           DateTime?
  mustChangePassword      Boolean @default(false)
  
  // 2FA
  twoFactorEnabled        Boolean @default(false)
  twoFactorMethod         TwoFactorMethod? // EMAIL | SMS | TOTP
  totpSecret              String? // TOTP seed
  
  // Soft lockout tracking
  failedLoginAttempts     Int @default(0)
  lastFailedLoginAt       DateTime?
  
  // Client associations
  clientProfiles          UserClientProfile[] // Many-to-many with ClientProfile
  createdTenantUserId     String? // If tenant, who approved this account
  
  // Audit
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Key Characteristics**:
- Email is globally unique (cannot create duplicate emails)
- firstName/lastName are user-specific (different for each client login)
- tenantId is nullable (SuperAdmin has no tenant)
- RLS prevents SUPERADMIN from seeing CLIENT users
- Password hashing: bcryptjs, 12 rounds for SUPERADMIN, 10 for others

---

#### Tenant
Represents a wedding planning business (company profile).
```prisma
model Tenant {
  id                      String
  
  // Business profile
  firstName               String // Primary contact first name
  lastName                String // Primary contact last name
  businessName            String
  phone                   String
  email                   String @unique // Business email
  webAddress              String?
  
  // Subscription
  subscriptionTier        SubscriptionTier // FREE | TRIAL | PAID
  subscriptionStartDate   DateTime?
  subscriptionEndDate     DateTime?
  mustRenewBy             DateTime? // 30 days before expiry
  lastNotifiedAt          DateTime? // Track notification sent
  
  // Status
  status                  TenantStatus // ACTIVE | SUSPENDED | ARCHIVED
  
  // Relations
  users                   User[]
  clientProfiles          ClientProfile[]
  inviteCodes             InviteCode[]
  payments                Payment[]
  
  // Audit
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Key Characteristics**:
- Profile data lives HERE, not in User model (unlike typical SaaS)
- Business email is unique (different from user emails)
- Subscription auto-suspends 30 days before expiry
- Notification triggers 2 weeks before expiry (lastNotifiedAt tracks this)
- SuperAdmin can create tenants (with email verification + temp password flow)

---

#### ClientProfile
Represents a couple getting married (wedding project).
```prisma
model ClientProfile {
  id                      String
  tenantId                String
  
  // Couple 1
  couple1FirstName        String
  couple1LastName         String
  
  // Couple 2 (optional)
  couple2FirstName        String?
  couple2LastName         String?
  
  // Contact
  email                   String @unique
  phone                   String?
  
  // Wedding info
  weddingDate             DateTime
  overallBudgetCents      Int // Stored as cents ($50k = 5000000)
  
  // Status
  status                  ClientStatus // ACTIVE | ARCHIVED
  
  // Relations
  users                   UserClientProfile[] // Many-to-many with User
  inviteCode              InviteCode? // One invite code (single-use for couple2)
  
  // Audit
  createdByUserId         String // Which tenant user created this
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Key Characteristics**:
- Stores couple names (both couple1 and optional couple2)
- Single email per client (invite code used to add partner with different email)
- Budget stored as cents (prevents floating point errors)
- created_by tracks which tenant user created this
- Archived clients stay ACTIVE even if tenant is ARCHIVED (data isolation rule)

---

### Authentication Models

#### Session
JWT + refresh token management (NextAuth sessions).
```prisma
model Session {
  id                      String
  userId                  String
  
  // JWT tokens
  sessionToken            String @unique
  refreshToken            String?
  refreshTokenExpiresAt   DateTime?
  
  // Tracking
  ipAddress               String?
  userAgent               String?
  expiresAt               DateTime
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Key Characteristics**:
- NextAuth manages these (one per user, concurrent sessions not allowed)
- Tracks IP + userAgent for device fingerprinting
- Used in combination with Device model for "trusted device" logic

---

#### Device
Device fingerprinting for "trust this device" feature.
```prisma
model Device {
  id                      String
  userId                  String
  
  // Fingerprint
  fingerprint             String @unique
  ipAddress               String
  userAgent               String
  
  // Trust
  isTrusted               Boolean @default(false)
  trustedAt               DateTime?
  
  // Tracking
  lastUsedAt              DateTime
  createdAt               DateTime @default(now())
}
```

**Key Characteristics**:
- Trusted devices skip 2FA on login
- Fingerprint = hash(IP + userAgent + browser info)
- Automatically cleaned up after 90 days of disuse

---

#### PasswordReset
Self-service password recovery with time-limited tokens.
```prisma
model PasswordReset {
  id                      String
  userId                  String
  
  // Token
  token                   String @unique
  expiresAt               DateTime // 1 hour from creation
  
  // Tracking
  usedAt                  DateTime?
  createdAt               DateTime @default(now())
}
```

**Key Characteristics**:
- Tokens expire 1 hour after creation
- One active token per user (new request invalidates old token)
- Email sent with secure reset link

---

#### TwoFactorChallenge
Manages 2FA flow (email/SMS/TOTP codes).
```prisma
model TwoFactorChallenge {
  id                      String
  userId                  String
  
  // Challenge details
  method                  TwoFactorMethod // EMAIL | SMS | TOTP
  code                    String // 6-digit code (hashed before storage)
  expiresAt               DateTime // 10 minutes
  
  // Tracking
  attempts                Int @default(0)
  maxAttempts             Int @default(5)
  usedAt                  DateTime?
  
  createdAt               DateTime @default(now())
}
```

**Key Characteristics**:
- One active challenge per user
- 6-digit code, 10-minute expiry
- Max 5 attempts before denial
- Methods: EMAIL, SMS, TOTP

---

#### OAuthAccount
Third-party provider linking (Google, Apple, Facebook).
```prisma
model OAuthAccount {
  id                      String
  userId                  String
  
  // Provider
  provider                String // google | apple | facebook
  providerUserId          String // Remote user ID
  
  // Profile
  email                   String // From provider
  name                    String?
  image                   String? // Avatar URL
  
  // Linking
  linkedAt                DateTime @default(now())
  
  // Unique constraint
  @@unique([provider, providerUserId])
}
```

**Key Characteristics**:
- Email-based account linking (allowDangerousEmailAccountLinking: true in NextAuth)
- Can link multiple providers to one user
- Stored provider profile data for account recovery

---

### Tenant Management Models

#### InviteCode
Shareable codes for adding second client user or branching tenant.
```prisma
model InviteCode {
  id                      String
  
  // Code details
  code                    String @unique // Random 8-char alphanumeric
  inviteEmail             String // Email code is sent to
  expiresAt               DateTime // 5 days from creation
  
  // Usage
  isUsed                  Boolean @default(false)
  usedAt                  DateTime?
  usedByUserId            String? // Who redeemed this code
  
  // Revocation
  isRevoked               Boolean @default(false)
  revokedAt               DateTime?
  revokedByUserId         String? // Who revoked this code
  
  // Purpose
  purpose                 InvitePurpose // CLIENT_INVITE | BRANCHED_TENANT
  
  // Relations
  tenantId                String
  clientProfileId         String? // For CLIENT_INVITE
  targetUserId            String? // For BRANCHED_TENANT (pending user)
  
  createdAt               DateTime @default(now())
}
```

**Key Characteristics**:
- Single-use (isUsed = true after redemption)
- 5-day expiry (expiresAt = now() + 5 days)
- Revocable (isRevoked = true, allows new code generation)
- Tracks who revoked (for audit trail)
- Two purposes:
  - CLIENT_INVITE: Add partner to wedding (links to ClientProfile)
  - BRANCHED_TENANT: Add second tenant admin (creates new User with PENDING status)

---

#### LoginAttempt
Failed/successful login tracking (730-day retention for compliance).
```prisma
model LoginAttempt {
  id                      String
  
  // User info
  userId                  String?
  email                   String // Always logged, even if user doesn't exist
  
  // Attempt details
  success                 Boolean
  reason                  String? // If failed: "invalid_password" | "account_locked" | etc
  
  // Request info
  ipAddress               String?
  userAgent               String?
  
  // Tracking
  createdAt               DateTime @default(now())
  
  @@index([email, success, createdAt])
}
```

**Key Characteristics**:
- Both successful and failed attempts logged
- 730-day retention (for compliance/forensics)
- Used for soft account lockout (5 failed attempts = 30-min freeze)
- Indexed by email for fast lookups
- Stored in BOTH LoginAttempt table AND AuditLog table

---

#### Payment
Revenue tracking (for SuperAdmin analytics dashboard).
```prisma
model Payment {
  id                      String
  tenantId                String
  
  // Payment details
  amountCents             Int // $100 = 10000 cents
  paymentDate             DateTime
  status                  PaymentStatus // PENDING | COMPLETED | FAILED | REFUNDED
  
  // Invoice
  invoiceNumber           String?
  description             String?
  
  // Tracking
  recordedByUserId        String // Which SuperAdmin recorded this
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@index([tenantId, paymentDate])
  @@index([status, paymentDate])
}
```

**Key Characteristics**:
- Amounts stored as cents (prevents floating point errors)
- SuperAdmin records all payments (for manual tracking or webhook integration)
- Indexed for fast revenue dashboard queries
- Used to calculate MRR, ARR, churn, lifetime value

---

### Audit & Compliance Models

#### AuditLog
Comprehensive action logging for compliance and security.
```prisma
model AuditLog {
  id                      String
  
  // Action
  action                  AuditAction // USER_CREATED | PASSWORD_CHANGED | EMAIL_VERIFIED | etc
  entity                  String // users | tenants | client_profiles | etc
  entityId                String // ID of affected entity
  
  // Actor
  userId                  String? // Who performed action (null for system)
  tenantId                String? // Tenant context (null for SuperAdmin actions)
  
  // Changes
  changes                 Json? // Before/after for data changes
  
  // Request context
  ipAddress               String?
  userAgent               String?
  
  // Metadata
  metadata                Json? // Additional context
  
  createdAt               DateTime @default(now())
  
  @@index([action, createdAt])
  @@index([userId, createdAt])
  @@index([tenantId, createdAt])
  @@index([entity, entityId])
}

enum AuditAction {
  // User management
  USER_CREATED
  USER_UPDATED
  USER_DELETED
  USER_LOCKED
  USER_UNLOCKED
  
  // Auth
  PASSWORD_CHANGED
  PASSWORD_RESET
  EMAIL_VERIFIED
  EMAIL_UNVERIFIED
  
  // 2FA
  TWO_FACTOR_ENABLED
  TWO_FACTOR_DISABLED
  
  // Tenant
  TENANT_CREATED
  TENANT_UPDATED
  TENANT_SUSPENDED
  TENANT_ARCHIVED
  
  // Subscription
  SUBSCRIPTION_UPGRADED
  SUBSCRIPTION_DOWNGRADED
  SUBSCRIPTION_RENEWED
  SUBSCRIPTION_SUSPENDED
  
  // Client
  CLIENT_CREATED
  CLIENT_UPDATED
  CLIENT_ARCHIVED
  
  // Invites
  INVITE_CODE_GENERATED
  INVITE_CODE_REVOKED
  INVITE_CODE_USED
  
  // Payments
  PAYMENT_RECORDED
  PAYMENT_REFUNDED
  
  // OAuth
  OAUTH_LINKED
  OAUTH_UNLINKED
  
  // Device
  DEVICE_TRUSTED
  DEVICE_UNTRUSTED
  
  // Sessions
  SESSION_CREATED
  SESSION_DESTROYED
  
  // Login
  LOGIN_SUCCESSFUL
  LOGIN_FAILED
}
```

**Key Characteristics**:
- Every significant action logged
- Tracks actor (userId), context (tenantId), request (IP, userAgent)
- Stores before/after state in JSON (for compliance audits)
- 30+ distinct action types
- Indexed for fast historical lookups
- 730-day retention

---

## 🔒 Row-Level Security (RLS) Implementation

RLS is enforced at **database layer**, not app layer. This means even if the API is compromised, the database prevents unauthorized access.

### RLS Context Variables

The app sets these via Supabase session context before executing queries:

```typescript
// In API route handler
const session = await getServerSession(authOptions);

// Set RLS context
const { data, error } = await supabase
  .rpc('set_rls_context', {
    user_role: session.user.role,
    user_id: session.user.id,
    tenant_id: session.user.tenantId
  });
```

### Policy Examples

#### SuperAdmin - View All Tenants
```sql
CREATE POLICY "superadmin_tenants_all" ON tenants
  FOR SELECT
  USING (current_setting('app.user_role') = 'SUPERADMIN');
```

#### Tenant - View Own Clients
```sql
CREATE POLICY "tenant_clients_own" ON client_profiles
  FOR SELECT
  USING (tenantId = current_setting('app.tenant_id')::uuid);
```

#### Client - View Own Profile
```sql
CREATE POLICY "client_profile_own" ON client_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT clientProfileId FROM user_client_profiles
      WHERE userId = current_setting('app.user_id')::uuid
    )
  );
```

### Total RLS Policies: 30+

Distribution:
- **SuperAdmin**: 6 policies (view all except client data)
- **Tenant**: 11 policies (view own data only)
- **Client**: 4 policies (view own data only)
- **Public**: 3 policies (signup, invite checking, login tracking)

All policies use `current_setting('app.user_role')`, `current_setting('app.user_id')`, and `current_setting('app.tenant_id')` for context.

---

## 🔐 Authentication Flows

### Standard Credentials Login (Email + Password)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/auth/callback/credentials
       │ { email, password }
       ▼
┌──────────────────────────────────────┐
│    NextAuth CredentialsProvider      │
├──────────────────────────────────────┤
│ 1. Find user by email                │
│ 2. Validate account status:          │
│    - Not LOCKED, INACTIVE, ARCHIVED  │
│ 3. Check email verified              │
│ 4. Compare password (bcryptjs)       │
│ 5. Check 2FA required?               │
│ 6. Validate tenant status (if TENANT)│
│ 7. Reset failedLoginAttempts on OK   │
│ 8. Log login attempt (audit)         │
└──────────────────────────────────────┘
       │
       ▼ Success
┌──────────────────────────────────────┐
│    NextAuth Session Callback         │
├──────────────────────────────────────┤
│ 1. Create JWT token with user data   │
│ 2. Set 24-hour expiry                │
│ 3. Include: id, email, role,         │
│    firstName, lastName, tenantId,    │
│    clientProfileId                   │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│    Create Session in Database        │
├──────────────────────────────────────┤
│ 1. Store JWT in sessions table       │
│ 2. Store IP + userAgent              │
│ 3. Set 24-hour expiry                │
│ 4. Return session cookie to client   │
└──────────────────────────────────────┘
       │
       ▼ Redirect
┌──────────────────────────────────────┐
│  Route Middleware (Protected Pages)  │
├──────────────────────────────────────┤
│ 1. Validate JWT in session cookie    │
│ 2. Set RLS context (role, id, etc)   │
│ 3. Allow/deny route based on role    │
└──────────────────────────────────────┘
```

### OAuth Login (Google/Apple/Facebook)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ Click "Login with Google"
       ▼
┌──────────────────────────────────────┐
│    Redirect to OAuth Provider        │
└──────────────────────────────────────┘
       │
       ▼ User approves
┌──────────────────────────────────────┐
│    OAuth Provider Returns Code       │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│    NextAuth OAuth Handler            │
├──────────────────────────────────────┤
│ 1. Exchange code for access token    │
│ 2. Fetch user profile from provider  │
│ 3. Get email from profile            │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│    Find/Create User by Email         │
├──────────────────────────────────────┤
│ If exists:                           │
│   - Link OAuthAccount to User        │
│ If not exists:                       │
│   - Create new User (CLIENT role)    │
│   - Create OAuthAccount              │
│   - Send "Account created" email     │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│    Proceed as Credentials Login      │
├──────────────────────────────────────┤
│ (Same as above: create session, etc) │
└──────────────────────────────────────┘
```

### 2FA Verification Flow

```
┌─────────────────────────────────┐
│  Credentials Login (Step 1)      │
│  Email + Password validated OK   │
└──────────────┬──────────────────┘
               │ But twoFactorEnabled = true
               ▼
┌─────────────────────────────────┐
│  2FA Challenge Selection        │
│  User picks: EMAIL | SMS | TOTP │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Send 2FA Code                  │
│  - 6-digit code                 │
│  - 10-minute expiry             │
│  - 5 max attempts               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  User Enters Code               │
│  POST /api/auth/2fa/verify      │
│  { code }                       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Validate Code                  │
│  - Check not expired            │
│  - Check attempts < 5           │
│  - Hash comparison              │
└──────────────┬──────────────────┘
               │ Success
               ▼
┌─────────────────────────────────┐
│  Mark Challenge Complete        │
│  Create Session                 │
│  (Same as credentials flow)     │
└─────────────────────────────────┘
```

---

## 📋 API Routes (To Be Built)

### Authentication Routes
- `POST /api/auth/signup` - Email signup (creates USER, sends verification)
- `POST /api/auth/callback/credentials` - Email/password login (NextAuth)
- `POST /api/auth/callback/google` - Google OAuth (NextAuth)
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/password-reset` - Request password reset email
- `POST /api/auth/password-reset-confirm` - Set new password with token
- `POST /api/auth/2fa/setup` - Enable 2FA (choose method)
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/logout` - Logout (destroy session)

### SuperAdmin Routes
- `GET /api/superadmin/tenants` - List all tenants with metrics
- `POST /api/superadmin/tenants` - Create new tenant (email verification)
- `GET /api/superadmin/payments` - Revenue dashboard
- `POST /api/superadmin/payments` - Record manual payment
- `GET /api/superadmin/audit-logs` - View audit logs (non-client events)
- `POST /api/superadmin/users/:userId/lock` - Lock user account
- `POST /api/superadmin/tenants/:tenantId/approve-branch` - Approve branched tenant

### Tenant Routes
- `GET /api/tenant/profile` - Get own business profile
- `PUT /api/tenant/profile` - Update own profile
- `POST /api/tenant/clients` - Create new client (generates invite code)
- `GET /api/tenant/clients` - List own clients
- `PUT /api/tenant/clients/:clientId` - Update client
- `POST /api/tenant/invite-codes` - Generate new invite code
- `GET /api/tenant/invite-codes` - List own invite codes
- `DELETE /api/tenant/invite-codes/:codeId` - Revoke invite code
- `GET /api/tenant/payments` - View own payments
- `GET /api/tenant/users` - List own users
- `POST /api/tenant/branch-request` - Request second tenant admin

### Client Routes
- `GET /api/client/profile` - Get own wedding profile
- `PUT /api/client/profile` - Update own wedding profile
- `GET /api/client/invite-codes/:code` - Check if invite code is valid
- `POST /api/client/join/:code` - Use invite code (add self to ClientProfile)

### Account Routes (All Authenticated Users)
- `GET /api/account/profile` - Get own user profile
- `PUT /api/account/profile` - Update firstName/lastName
- `POST /api/account/password-change` - Change password (requires current password)
- `GET /api/account/sessions` - List own sessions
- `DELETE /api/account/sessions/:sessionId` - Logout from device
- `GET /api/account/devices` - List own devices
- `POST /api/account/devices/:deviceId/trust` - Mark device as trusted
- `DELETE /api/account/devices/:deviceId/untrust` - Untrust device
- `GET /api/account/oauth-accounts` - List linked OAuth providers
- `DELETE /api/account/oauth-accounts/:provider` - Unlink OAuth provider

---

## 🚀 Deployment Path

### Local Development (Current)
```bash
npm run dev
# Uses: PostgreSQL Docker, .env.local
```

### Production (Supabase Cloud)
```bash
# 1. Create Supabase account
# 2. Create new project
# 3. Get connection string from project settings
# 4. Update DATABASE_URL in .env.production
# 5. Run migrations on cloud database
npx prisma db push --skip-generate

# 6. Apply RLS policies via Supabase dashboard
# 7. Deploy to Vercel
npm run build
git push  # Triggers Vercel deployment
```

**Zero code changes needed** - PostgreSQL + RLS policies work the same locally and in cloud.

---

## 📊 Database Performance

### Indexes (for fast queries)

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, accountStatus);
CREATE INDEX idx_users_tenant_id ON users(tenantId);

-- Clients
CREATE INDEX idx_clients_tenant_id ON client_profiles(tenantId);
CREATE INDEX idx_clients_email ON client_profiles(email);

-- Invites
CREATE INDEX idx_invites_code ON invite_codes(code);
CREATE INDEX idx_invites_email ON invite_codes(inviteEmail);
CREATE INDEX idx_invites_expires ON invite_codes(expiresAt);

-- Audit logs
CREATE INDEX idx_audit_action_date ON audit_logs(action, createdAt DESC);
CREATE INDEX idx_audit_user_date ON audit_logs(userId, createdAt DESC);
CREATE INDEX idx_audit_tenant_date ON audit_logs(tenantId, createdAt DESC);

-- Payments
CREATE INDEX idx_payments_tenant_date ON payments(tenantId, paymentDate DESC);
CREATE INDEX idx_payments_status ON payments(status, paymentDate DESC);

-- Login attempts
CREATE INDEX idx_login_email_date ON login_attempts(email, createdAt DESC);
CREATE INDEX idx_login_success ON login_attempts(success, createdAt DESC);
```

### Query Optimization

Common slow queries to avoid:
- ❌ Selecting all audit logs without filtering by action/user/tenant/date
- ❌ Counting all login attempts (use summary table instead)
- ❌ Joining users to all client profiles (use UserClientProfile junction table)
- ❌ Fetching all payments without pagination (paginate by date)

---

## 🔑 Security Checklist

- [ ] Environment variables set in `.env.local` (never committed)
- [ ] NEXTAUTH_SECRET generated with `openssl rand -base64 32`
- [ ] Password hashing rounds: 12 for SUPERADMIN, 10 for others
- [ ] RLS policies applied to database
- [ ] Rate limiting on login attempts (soft lockout after 5)
- [ ] Email verification required before account activation
- [ ] 2FA available for high-security accounts
- [ ] Audit logs for all significant actions
- [ ] Session tokens in httpOnly cookies (not localStorage)
- [ ] CORS configured for known domains only
- [ ] SQL injection prevented (Prisma parameterized queries)

---

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Local environment setup guide
- [schema.prisma](./prisma/schema.prisma) - Database schema
- [rls-policies.sql](./prisma/rls-policies.sql) - RLS policy definitions
- [auth.ts](./src/lib/auth.ts) - NextAuth configuration
- [seed.ts](./prisma/seed.ts) - Test data generation

---

**Last Updated**: [Current Date]
**Version**: 0.1.0
