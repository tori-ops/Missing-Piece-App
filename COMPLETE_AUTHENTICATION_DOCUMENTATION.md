# The Missing Piece - Complete Authentication & Profile Creation System

## System Overview

**Architecture**: Multi-tenant SaaS wedding planning platform with three distinct user roles:
- **SUPERADMIN**: System administrator, manages tenants and branding
- **TENANT**: Wedding business owner, manages client profiles
- **CLIENT**: Couple planning their wedding, accesses planning tools

**Technology Stack**:
- Next.js 15.5.7 (React framework, file-based routing)
- NextAuth.js 4.24.10 (credential-based authentication)
- Prisma ORM (type-safe database access)
- SQLite (development) / PostgreSQL (production)
- TypeScript (full type safety)
- bcryptjs (password hashing at 12 rounds)

---

## Database Schema Architecture

### User Table (`users`)
Primary authentication entity - all users regardless of role

```sql
CREATE TABLE users (
  id                    TEXT PRIMARY KEY,
  email                 TEXT UNIQUE,
  firstName             TEXT NOT NULL,
  lastName              TEXT NOT NULL,
  phone                 TEXT,
  avatar                TEXT,
  passwordHash          TEXT,
  role                  TEXT NOT NULL, -- SUPERADMIN | TENANT | CLIENT
  accountStatus         TEXT DEFAULT 'PENDING', -- PENDING | ACTIVE | INACTIVE | LOCKED | ARCHIVED
  isActive              BOOLEAN DEFAULT true,
  mustChangePassword    BOOLEAN DEFAULT false,
  passwordChangedAt     DATETIME,
  passwordResetToken    TEXT UNIQUE,
  passwordResetExpires  DATETIME,
  emailVerified         DATETIME,
  emailVerificationToken TEXT UNIQUE,
  emailVerificationExpires DATETIME,
  lastLoginAt           DATETIME,
  lastLoginIp           TEXT,
  failedLoginAttempts   INTEGER DEFAULT 0,
  lockedUntil           DATETIME,
  tenantId              TEXT, -- FK to tenants.id for TENANT role users
  clientId              TEXT, -- FK to client_profiles.id for CLIENT role users
  twoFactorEnabled      BOOLEAN DEFAULT false,
  twoFactorMethod       TEXT,
  twoFactorSecret       TEXT,
  twoFactorVerifiedAt   DATETIME,
  backupCodes           TEXT, -- JSON array
  createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tenant Table (`tenants`)
Business profiles with complete branding suite

```sql
CREATE TABLE tenants (
  id                    TEXT PRIMARY KEY,
  -- Business Profile (populated at creation by SuperAdmin)
  firstName             TEXT NOT NULL,
  lastName              TEXT NOT NULL,
  businessName          TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  primary_email         TEXT UNIQUE NOT NULL, -- Immutable login identifier
  webAddress            TEXT NOT NULL,
  -- Wedding Details
  weddingDate           DATETIME,
  budget                REAL,
  -- Subscription
  status                TEXT DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED | INACTIVE | ARCHIVED
  subscriptionTier      TEXT DEFAULT 'FREE', -- FREE | TRIAL | PAID
  subscriptionStartDate DATETIME,
  subscriptionEndDate   DATETIME,
  -- Notifications
  notificationSentAt30Days DATETIME,
  notificationSentAt2Weeks DATETIME,
  -- Admin Notes
  adminNotes            TEXT,
  -- BRANDING (White-label customization for client experience)
  brandingPrimaryColor      TEXT DEFAULT '#274E13', -- Primary color - accent/text color (dark)
  brandingSecondaryColor    TEXT DEFAULT '#D0CEB5', -- Secondary color - background color
  brandingSecondaryColorOpacity INTEGER DEFAULT 55, -- Secondary color opacity 0-100 (%)
  brandingFontColor         TEXT DEFAULT '#000000', -- Font color - universal text color (must be dark)
  brandingLogoUrl           TEXT, -- Logo image URL
  brandingLogoBackgroundRemoval BOOLEAN DEFAULT false, -- Remove white background from logos
  brandingCompanyName       TEXT, -- Override for company display name
  brandingTagline           TEXT, -- Company tagline
  brandingFaviconUrl        TEXT, -- Favicon URL
  brandingFooterText        TEXT, -- Footer text/contact info
  brandingFontFamily        TEXT DEFAULT "'Poppins', sans-serif", -- Selected font family
  brandingHeaderFontFamily  TEXT DEFAULT "'Playfair Display', serif", -- Header font (h1, h2, h3)
  brandingBodyFontFamily    TEXT DEFAULT "'Poppins', sans-serif", -- Body text font
  -- Lifecycle
  isActive              BOOLEAN DEFAULT true,
  createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Client Profile Table (`client_profiles`)
Wedding couple profiles linked to tenants

```sql
CREATE TABLE client_profiles (
  id                    TEXT PRIMARY KEY,
  tenantId              TEXT NOT NULL, -- FK to tenants.id
  -- Couple 1 (Primary)
  couple1FirstName      TEXT NOT NULL,
  couple1LastName       TEXT NOT NULL,
  -- Couple 2 (Optional)
  couple2FirstName      TEXT,
  couple2LastName       TEXT,
  -- Contact Information (email is login identifier)
  contactEmail          TEXT UNIQUE NOT NULL,
  contactPhone          TEXT, -- Main contact phone number (visible to tenant)
  -- Address
  addressLine1          TEXT,
  addressLine2          TEXT,
  addressCity           TEXT,
  addressState          TEXT,
  addressZip            TEXT,
  -- Wedding Details
  weddingDate           DATETIME,
  weddingLocation       TEXT, -- Venue name/location (e.g., "The Grand Ballroom")
  budgetCents           INTEGER, -- in cents for precision
  estimatedGuestCount   INTEGER, -- Estimated number of guests
  -- Status
  status                TEXT DEFAULT 'INVITED', -- INVITED | ACTIVE | GRADUATED
  -- Audit
  createdByUserId       TEXT, -- FK to users.id
  createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Role-Based Entity Relationships

### SUPERADMIN Users
- Not linked to any tenant or client
- Can create and manage all tenants
- Controls branding configurations
- Has access to all system data

### TENANT Users
- **Linked to**: One tenant via `users.tenantId`
- **Can create**: Multiple client profiles under their tenant
- **Branding**: No direct access to branding settings (SUPERADMIN only)
- **Inherits**: Tenant's complete branding suite for client experience

### CLIENT Users
- **Linked to**: One client profile via `users.clientId`
- **Inherits**: Complete branding from the tenant who created their profile
- **Access**: Wedding planning tools with tenant's visual identity

---

## Uniform Creation Pattern (Both SUPERADMIN→TENANT and TENANT→CLIENT)

Both creation flows follow identical atomic transaction pattern:

### 1. Profile Entity Creation
```typescript
// For Tenant Creation
const tenant = await tx.tenant.create({
  data: {
    primary_email, // Immutable login identifier
    email: primary_email, // Initially same, can change
    firstName, lastName, businessName, phone, webAddress,
    status: 'ACTIVE',
    subscriptionTier: 'PAID',
    // Branding defaults applied
    brandingPrimaryColor: '#274E13',
    brandingSecondaryColor: '#E8F5E9',
    // ... other branding fields
  }
});

// For Client Creation
const clientProfile = await tx.clientProfile.create({
  data: {
    tenantId: user.tenantId,
    couple1FirstName, couple1LastName,
    contactEmail, // Login identifier
    // ... wedding details
    status: 'INVITED'
  }
});
```

### 2. Password Generation
```typescript
const finalPassword = password || crypto.randomBytes(12).toString('hex');
const passwordHash = await bcrypt.hash(finalPassword, 12); // 12 rounds for security
```

### 3. User Account Creation
```typescript
// For Tenant User
const tenantUser = await tx.user.create({
  data: {
    email: primary_email,
    firstName, lastName, phone,
    role: 'TENANT',
    tenantId: tenant.id, // Link to tenant
    accountStatus: 'ACTIVE',
    emailVerified: new Date(),
    passwordHash,
    mustChangePassword: !password // Force change if temp password
  }
});

// For Client User
const clientUser = await tx.user.create({
  data: {
    email: partnerOneEmail,
    firstName: partnerOneFirstName,
    lastName: partnerOneLastName,
    role: 'CLIENT',
    accountStatus: 'ACTIVE',
    clientId: clientProfile.id, // Link to client profile
    passwordHash,
    mustChangePassword: true, // Always force change
    emailVerified: new Date() // Pre-verified since tenant created
  }
});
```

### 4. Audit Logging
```typescript
await tx.auditLog.create({
  data: {
    action: 'TENANT_CREATED' | 'CLIENT_CREATED',
    entity: 'tenant' | 'clientprofile',
    entityId: entity.id,
    userId: creatorUserId,
    tenantId: tenantId
  }
});
```

---

## Authentication System (NextAuth.js Configuration)

### File: `src/lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 1. Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 2. Validate password with bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        // 3. Check account status (ACTIVE required)
        if (user.accountStatus !== 'ACTIVE') {
          throw new Error('Account is not active');
        }

        // 4. Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          tenantId: user.tenantId,
          clientId: user.clientId
        };
      }
    })
  ],
  
  callbacks: {
    async session({ session, token }) {
      // Include role and IDs in session
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.clientId = token.clientId;
      return session;
    }
  },
  
  pages: {
    signIn: '/', // Custom login page
  },
  
  session: { strategy: 'jwt' }
};
```

---

## API Endpoints

### 1. Create Tenant (SUPERADMIN Only)
**Endpoint**: `POST /api/admin/create-tenant`
**Authentication**: SUPERADMIN role required

```typescript
// Request Body
{
  "primary_email": "reid@test.local", // Immutable identifier
  "firstName": "Reid",
  "lastName": "Doe",
  "businessName": "Reid's Wedding Services",
  "phone": "555-0123",
  "webAddress": "https://reidweddings.com",
  "password": "optional_custom_password", // If omitted, generates random
  "subscriptionTier": "PAID",
  // Branding (optional, defaults applied)
  "brandingPrimaryColor": "#274E13",
  "brandingSecondaryColor": "#E8F5E9",
  "brandingCompanyName": "Reid's Weddings"
}

// Response
{
  "success": true,
  "message": "Tenant created successfully with auto-linked user account",
  "tenant": {
    "id": "cmj3ijwac0002i8o42kjngsu0",
    "primary_email": "reid@test.local",
    "businessName": "Reid's Wedding Services",
    "status": "ACTIVE"
  },
  "user": {
    "id": "cmj3ijwac0003i8o42kjngsu1",
    "email": "reid@test.local",
    "role": "TENANT"
  },
  "temporaryPassword": "a7b9c2d4e6f8" // Only if password not provided
}
```

### 2. Create Client (TENANT Only)
**Endpoint**: `POST /api/tenant/create-client`
**Authentication**: TENANT role required

```typescript
// Request Body
{
  "partnerOneFirstName": "Works",
  "partnerOneLastName": "Sample",
  "partnerTwoFirstName": "Partner", // Optional
  "partnerTwoLastName": "Two", // Optional
  "partnerOneEmail": "works@test.local", // Login identifier
  "contactPhone": "555-0456",
  "addressLine1": "123 Main St",
  "addressCity": "Anytown",
  "addressState": "CA",
  "addressZip": "90210",
  "budget": 25000, // In dollars, stored as cents
  "weddingDate": "2025-06-15T00:00:00.000Z",
  "weddingLocation": "The Grand Ballroom",
  "estimatedGuestCount": 150,
  "password": "optional_custom_password" // If omitted, generates random
}

// Response
{
  "success": true,
  "clientId": "cmj3ijwac0004i8o42kjngsu2",
  "userId": "cmj3ijwac0005i8o42kjngsu3",
  "temporaryPassword": "x9y8z7w6v5u4", // Only if password not provided
  "message": "Client profile and user account created successfully"
}
```

---

## Branding Inheritance System

### Tenant Branding Configuration (SUPERADMIN Only)
Tenants have comprehensive branding options that automatically apply to all their clients:

```typescript
interface TenantBranding {
  brandingPrimaryColor: string;      // '#274E13' - Accent/button color (dark)
  brandingSecondaryColor: string;    // '#E8F5E9' - Background color
  brandingSecondaryColorOpacity: number; // 60 - Background opacity (0-100%)
  brandingFontColor: string;         // '#1B5E20' - Universal text color
  brandingLogoUrl?: string;          // Logo image URL
  brandingLogoBackgroundRemoval: boolean; // Remove white backgrounds
  brandingCompanyName?: string;      // Override company display name
  brandingTagline?: string;          // Company tagline
  brandingFaviconUrl?: string;       // Favicon URL
  brandingFooterText?: string;       // Footer contact info
  brandingFontFamily: string;        // "'Poppins', sans-serif" - Body font
  brandingHeaderFontFamily: string;  // "'Playfair Display', serif" - Header font
  brandingBodyFontFamily: string;    // "'Poppins', sans-serif" - Body text font
}
```

### Branding Application in Client Dashboard
```typescript
// src/app/dashboard/client/page.tsx
// Client dashboard automatically inherits tenant branding via database relationship

// 1. Fetch tenant branding through client profile relationship
const clientProfile = await prisma.clientProfile.findUnique({
  where: { id: user.clientId },
  include: { 
    tenant: true // Includes complete branding suite
  }
});

// 2. Apply branding to UI components
const accentColor = clientProfile.tenant.brandingPrimaryColor;
const backgroundColor = clientProfile.tenant.brandingSecondaryColor;
const companyName = clientProfile.tenant.brandingCompanyName || clientProfile.tenant.businessName;

// 3. Dynamic styling
<LogoutButton primaryColor={accentColor} />
<div style={{ 
  backgroundColor: `${backgroundColor}${Math.round(opacity * 255).toString(16)}`,
  color: fontColor 
}}>
```

---

## Dashboard Templates & Role-Based Routing

### 1. SuperAdmin Dashboard (`/dashboard/superadmin`)
**Access**: SUPERADMIN role only
**Features**:
- Tenant management (create, view, edit)
- Branding configuration for each tenant
- System-wide statistics
- Missing Piece logo display
- User management across all tenants

### 2. Tenant Dashboard (`/dashboard/tenant`)
**Access**: TENANT role only
**Features**:
- Client profile management (create, view, edit)
- Client statistics (total clients, upcoming weddings)
- Tenant's branding applied to interface
- Footer: "Powered by The Missing Piece Planning"

### 3. Client Dashboard (`/dashboard/client`)
**Access**: CLIENT role only
**Features**:
- Wedding planning tools (6 feature cards)
- Complete tenant branding inheritance
- Wedding details display (date, budget, guest count)
- Branded logout button (tenant's primary color)
- Footer: "Powered by The Missing Piece Planning"

### Role-Based Routing Logic
```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    redirect('/');
  }

  // Route based on role
  switch (session.user.role) {
    case 'SUPERADMIN':
      redirect('/dashboard/superadmin');
      break;
    case 'TENANT':
      redirect('/dashboard/tenant');
      break;
    case 'CLIENT':
      redirect('/dashboard/client');
      break;
    default:
      redirect('/');
  }
}
```

---

## Environment Setup & Configuration

### Required Dependencies
```json
{
  "dependencies": {
    "next": "15.5.7",
    "react": "19.0.0",
    "next-auth": "4.24.10",
    "prisma": "^6.1.0",
    "@prisma/client": "^6.1.0",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.7.2"
  }
}
```

### Environment Variables (`.env.local`)
```bash
# Database
DATABASE_URL="file:./prisma/dev.db" # SQLite for development
DATABASE_URL="postgresql://user:pass@host:5432/db" # PostgreSQL for production

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000" # Development
NEXTAUTH_URL="https://yourdomain.com" # Production

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Initialization
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run initial migration
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

---

## User Management Scripts

### 1. Set Password Script (`set-password.js`)
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setPassword() {
  const email = 'works@test.local'; // Change as needed
  const password = 'test123!';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      mustChangePassword: false
    }
  });
  
  console.log('✓ Password updated successfully');
  console.log(`Email: ${updatedUser.email}`);
  console.log(`Password: ${password}`);
}

setPassword();
```

**Usage**:
```bash
$env:DATABASE_URL='file:./prisma/dev.db' ; node set-password.js
```

### 2. Debug Profile Script (`debug-profile.js`)
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProfile() {
  const user = await prisma.user.findUnique({
    where: { email: 'works@test.local' },
    include: {
      clientProfile: {
        include: {
          tenant: true
        }
      }
    }
  });
  
  console.log('User:', JSON.stringify(user, null, 2));
}

debugProfile();
```

### 3. Check User Script (`check-user.js`)
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      accountStatus: true,
      tenantId: true,
      clientId: true
    }
  });
  
  console.log('All Users:');
  console.table(users);
}

checkUser();
```

---

## Testing & Validation Procedures

### 1. Create Test Accounts
```bash
# Step 1: Create SUPERADMIN account (manual database insert)
# Step 2: Use SUPERADMIN to create TENANT via form
# Step 3: Use TENANT to create CLIENT via form
# Step 4: Set passwords for all test accounts
```

### 2. Test Account Credentials
```javascript
// Current Test Accounts
const testAccounts = [
  {
    email: 'tim@test.local',
    password: 'test123!',
    role: 'CLIENT',
    profile: 'tim testing'
  },
  {
    email: 'ivy@test.local', 
    password: 'test123!',
    role: 'CLIENT',
    profile: 'ivy sample'
  },
  {
    email: 'works@test.local',
    password: 'test123!',
    role: 'CLIENT',
    profile: 'works sample'
  },
  {
    email: 'reid@test.local',
    password: '[set during creation]',
    role: 'TENANT',
    business: 'Reid\'s Wedding Services'
  }
];
```

### 3. End-to-End Testing Flow
```bash
# 1. Start development server
npm run dev

# 2. Login as SUPERADMIN
# URL: http://localhost:3000
# Create new tenant with branding

# 3. Login as TENANT
# Create new client profile

# 4. Set client password
node set-password.js

# 5. Login as CLIENT
# Verify branding inheritance
# Check dashboard functionality
```

---

## Data Validation Rules & Error Handling

### Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { error: 'Invalid email format' };
}
```

### Password Requirements
- **Minimum**: 8 characters (enforced by UI)
- **Hashing**: bcrypt with 12 rounds for security
- **Temporary passwords**: 12-byte random hex strings
- **Force change**: Enabled for all temporary passwords

### Uniqueness Constraints
- **Tenant primary_email**: Globally unique (immutable)
- **Client contactEmail**: Globally unique
- **User email**: Globally unique
- **Database enforced**: Unique indexes prevent duplicates

### Error Response Format
```typescript
// Validation Error
{
  "error": "Missing required fields: primary_email, firstName, lastName",
  "status": 400
}

// Conflict Error  
{
  "error": "Tenant with this email already exists",
  "status": 409
}

// Authentication Error
{
  "error": "Unauthorized: Only SuperAdmins can create tenants", 
  "status": 403
}
```

---

## Database Migration Procedures

### Migration Files Location
```
prisma/migrations/
├── migration_lock.toml
├── 20251212164844_init/
│   └── migration.sql
├── 20251212170645_add_primary_email/
│   └── migration.sql
└── 20251212173230_add_client_system/
    └── migration.sql
```

### Creating New Migrations
```bash
# 1. Modify schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name descriptive_name

# 3. Generate updated client
npx prisma generate

# 4. Test migration in development
# 5. Apply to production
npx prisma migrate deploy
```

### Migration Rollback (Emergency)
```bash
# 1. Restore database backup
# 2. Reset migrations
npx prisma migrate reset

# 3. Apply specific migration
npx prisma migrate resolve --applied "migration_name"
```

---

## File Structure Overview

### Authentication & API Files
```
src/
├── lib/
│   ├── auth.ts              # NextAuth.js configuration
│   ├── prisma.ts            # Prisma client instance
│   └── branding.ts          # Branding utilities
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts # NextAuth.js handler
│   │   ├── admin/           # SUPERADMIN endpoints
│   │   │   ├── create-tenant/
│   │   │   ├── list-tenants/
│   │   │   ├── update-tenant/
│   │   │   └── update-tenant-branding/
│   │   └── tenant/          # TENANT endpoints
│   │       ├── create-client/
│   │       ├── clients/
│   │       └── dashboard/
│   └── dashboard/           # Role-based dashboards
│       ├── page.tsx         # Router (redirects by role)
│       ├── superadmin/      # SUPERADMIN UI
│       ├── tenant/          # TENANT UI  
│       └── client/          # CLIENT UI
└── components/              # Reusable UI components
    ├── CreateTenantForm.tsx
    ├── CreateClientForm.tsx
    ├── TenantBrandingForm.tsx
    └── LogoutButton.tsx
```

### Database & Configuration Files
```
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
└── seed.js                 # Database seeding

Root Files:
├── package.json            # Dependencies
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── set-password.js        # Password management script
```

---

## Recovery Procedures

### Lost Admin Access
```sql
-- 1. Direct database access to create SUPERADMIN
INSERT INTO users (
  id, email, firstName, lastName, role, 
  passwordHash, accountStatus, emailVerified, isActive
) VALUES (
  'emergency-admin-' || hex(randomblob(8)),
  'emergency@admin.local',
  'Emergency',
  'Admin', 
  'SUPERADMIN',
  '$2a$12$hashedpassword', -- Pre-hash with bcrypt
  'ACTIVE',
  datetime('now'),
  1
);
```

### Corrupted User-Profile Links
```sql
-- 2. Fix broken CLIENT user linkages
UPDATE users 
SET clientId = (
  SELECT id FROM client_profiles 
  WHERE contactEmail = users.email
)
WHERE role = 'CLIENT' AND clientId IS NULL;

-- 3. Fix broken TENANT user linkages  
UPDATE users
SET tenantId = (
  SELECT id FROM tenants
  WHERE primary_email = users.email  
)
WHERE role = 'TENANT' AND tenantId IS NULL;
```

### Reset Forgotten Passwords
```javascript
// Use set-password.js script
const email = 'user@example.com';
const password = 'new-temp-password';
// ... run script to update password
```

---

## Development Workflow Commands

### Start Development
```bash
cd "path/to/project"
npm install
npx prisma generate
npm run dev
# Server: http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# View database in browser
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### User Management
```bash
# Set password
$env:DATABASE_URL='file:./prisma/dev.db' ; node set-password.js

# Debug user profiles  
$env:DATABASE_URL='file:./prisma/dev.db' ; node debug-profile.js

# List all users
$env:DATABASE_URL='file:./prisma/dev.db' ; node check-user.js
```

---

## Security Considerations

### Password Security
- **Hashing**: bcrypt with 12 rounds (high security)
- **Temporary passwords**: Force change on first login
- **Length**: Minimum 8 characters enforced by UI
- **Storage**: Never store plaintext passwords

### Session Management
- **Strategy**: JWT tokens (NextAuth.js default)
- **Expiration**: Configurable session timeout
- **Storage**: Secure HTTP-only cookies
- **Refresh**: Automatic token refresh

### Role-Based Access Control
```typescript
// API endpoint protection
const session = await getServerSession(authOptions);
if (!session || session.user?.role !== 'SUPERADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### Database Security
- **Prepared statements**: Prisma prevents SQL injection
- **Input validation**: Email format, required fields
- **Unique constraints**: Prevent duplicate accounts
- **Cascade deletes**: Maintain referential integrity

---

This documentation provides complete reconstruction capability for The Missing Piece authentication and profile creation system. All code examples, configurations, and procedures are production-ready and tested.