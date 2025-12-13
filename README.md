# 🎉 The Missing Piece - Wedding Planning SaaS

A modern, multi-tenant wedding planning platform built with Next.js, Supabase, and NextAuth.js. Designed for wedding planners to manage multiple clients with complete data isolation and role-based access control.

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Tenant Isolation**: Each wedding planning business is completely isolated
- **Row-Level Security (RLS)**: Database-layer enforcement of data boundaries
- **3-Tier Access Control**: SUPERADMIN, TENANT, CLIENT roles with granular permissions

### 👥 User Management
- **Email + Password Authentication**: Secure credential-based login
- **OAuth Integration**: Login via Google, Apple, Facebook
- **Two-Factor Authentication**: Email, SMS, or TOTP-based 2FA
- **Device Trust**: Skip 2FA on trusted devices
- **Account Lockout Protection**: Soft 30-minute freeze after 5 failed attempts

### 💍 Client Management
- **Client Profiles**: Couple information with shared workspace
- **Multi-User Access**: Both partners can login (different emails, same profile)
- **Invite Codes**: 5-day expiring, single-use codes for onboarding
- **Account Status Tracking**: ACTIVE, ARCHIVED status with audit trails

### 📊 Subscription Management
- **Tier System**: FREE, TRIAL, PAID subscription levels
- **Auto-Suspension**: Automatic suspension 30 days before renewal
- **Notification Reminders**: Force notification 2 weeks before expiry
- **Payment Tracking**: Complete revenue history for analytics

### 📋 Audit & Compliance
- **Comprehensive Logging**: 30+ action types tracked
- **730-Day Retention**: Login attempts and audit logs retained for compliance
- **IP & Device Tracking**: Every action logged with request context
- **User Accountability**: Full audit trail for all operations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15.5.7 (App Router) |
| **Authentication** | NextAuth.js 4.24.10 |
| **Database** | Supabase PostgreSQL 16 |
| **ORM** | Prisma 6.19.1 |
| **Security** | Row-Level Security (RLS) policies at database layer |
| **Hashing** | bcryptjs (12 rounds SUPERADMIN, 10 rounds others) |
| **Email** | SMTP (Gmail configured) |
| **Deployment** | Vercel + Supabase |

---

## 📖 Quick Start

### Prerequisites
- Node.js 18.17.0+ ([download](https://nodejs.org/))
- Docker ([download](https://www.docker.com/)) for local Supabase
- Git ([download](https://git-scm.com/))

### Setup (5 minutes)

1. **Clone repository**
```bash
git clone <repo-url>
cd "The Missing Piece App"
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start local Supabase**
```bash
docker run -d --name supabase_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 54321:5432 \
  postgres:16-alpine
```

5. **Apply database schema**
```bash
npm run prisma:db-push
```

6. **Apply RLS policies**
```bash
# Copy contents of prisma/rls-policies.sql
# Paste into Supabase SQL editor or psql
psql postgresql://postgres:postgres@localhost:54321/postgres < prisma/rls-policies.sql
```

7. **Seed test data**
```bash
npm run prisma:seed
```

8. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Test Accounts

After running `npm run prisma:seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **SUPERADMIN** | superadmin@missingpiece.local | SuperAdmin123! |
| **TENANT** | sarah@eliteweddings.local | TenantPassword123! |
| **CLIENT** | emma@example.local | ClientPassword123! |

---

## 📁 Project Structure

```
the-missing-piece-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── superadmin/        # SuperAdmin dashboard
│   │   ├── tenant/            # Tenant dashboard
│   │   └── client/            # Client workspace
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── email.ts           # Email sending utilities
│   ├── middleware.ts          # Route protection middleware
│   └── types/                 # TypeScript types
│
├── prisma/
│   ├── schema.prisma          # Database schema (23 models)
│   ├── rls-policies.sql       # Row-level security policies
│   ├── seed.ts                # Test data seeding
│   └── migrations/            # Prisma migrations (auto-generated)
│
├── public/                     # Static files
├── .env.example                # Environment template
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── SETUP.md                   # Local setup guide
├── ARCHITECTURE.md            # Architecture documentation
└── README.md                  # This file
```

---

## 🔐 Security Features

### Database Layer (Row-Level Security)
- **30+ RLS Policies**: Enforced at database layer, not just application
- **Context-Aware Queries**: User role, ID, and tenant ID control all data access
- **Tenant Isolation**: TENANT users cannot see other tenants' data
- **Client Privacy**: SuperAdmin cannot see client couple information

### Authentication Layer
- **Bcryptjs Hashing**: 12 rounds for SUPERADMIN, 10 for others
- **Session Management**: JWT-based sessions with 24-hour expiry
- **Device Fingerprinting**: Track and trust specific devices
- **2FA Options**: Email, SMS, or TOTP-based second factor

### Audit & Compliance
- **Comprehensive Logging**: Every significant action logged
- **Long Retention**: 730-day retention for audit trails
- **User Accountability**: Know who did what, when, from where
- **Failed Login Tracking**: Soft account lockout (30 min after 5 failures)

### API Security
- **Parameterized Queries**: Prisma prevents SQL injection
- **CORS Protection**: Configure for known domains only
- **Rate Limiting**: Prevent brute force attacks
- **httpOnly Cookies**: Session tokens not accessible to JavaScript

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Step-by-step local development setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete architecture and design reference |
| [schema.prisma](./prisma/schema.prisma) | Database schema with 23 models and relationships |
| [rls-policies.sql](./prisma/rls-policies.sql) | Row-level security policy definitions |

---

## 🚀 Development Workflow

### Starting Development
```bash
npm run dev
# Visit http://localhost:3000
```

### Database Management
```bash
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create new migration
npm run prisma:db-push     # Push schema without migrations
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:seed        # Run seeding script
```

### Code Quality
```bash
npm run type-check         # TypeScript type checking
npm run lint              # ESLint
npm run format            # Prettier formatting
```

### Building for Production
```bash
npm run build
npm start
```

---

## 🔄 API Endpoints Overview

### Authentication
```
POST   /api/auth/signup                    # Email signup
POST   /api/auth/callback/credentials      # Email/password login (NextAuth)
POST   /api/auth/callback/google           # Google OAuth (NextAuth)
POST   /api/auth/verify-email              # Verify email address
POST   /api/auth/password-reset            # Request password reset
POST   /api/auth/password-reset-confirm    # Confirm password reset
```

### SuperAdmin
```
GET    /api/superadmin/tenants             # List all tenants
POST   /api/superadmin/tenants             # Create tenant
GET    /api/superadmin/payments            # Revenue dashboard
GET    /api/superadmin/audit-logs          # View audit logs
```

### Tenant
```
GET    /api/tenant/profile                 # Get business profile
PUT    /api/tenant/profile                 # Update profile
GET    /api/tenant/clients                 # List clients
POST   /api/tenant/clients                 # Create client
GET    /api/tenant/invite-codes            # List invite codes
POST   /api/tenant/invite-codes            # Generate new code
```

### Client
```
GET    /api/client/profile                 # Get wedding profile
PUT    /api/client/profile                 # Update profile
GET    /api/client/invite-codes/:code      # Check invite code validity
POST   /api/client/join/:code              # Use invite code
```

### Account (All Authenticated Users)
```
GET    /api/account/profile                # Get user profile
PUT    /api/account/profile                # Update profile
POST   /api/account/password-change        # Change password
GET    /api/account/2fa/setup              # Setup 2FA
POST   /api/account/2fa/verify             # Verify 2FA code
```

---

## 🌍 Environment Variables

All required environment variables are documented in [`.env.example`](.env.example). Copy to `.env.local` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@missingpiece.local"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check Docker container is running
docker ps | grep supabase_postgres

# Restart container
docker start supabase_postgres
```

### Type Errors After schema.prisma Changes
```bash
npm run prisma:generate
npm run type-check
```

### NextAuth Secret Not Set
```bash
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET in .env.local
```

### RLS Policy Errors
- Verify PostgreSQL version is 12+ (`psql --version`)
- Check all RLS policies were applied (`SELECT * FROM pg_policies;`)
- Ensure app sets RLS context before database queries

See [SETUP.md](./SETUP.md) for more troubleshooting.

---

## 📦 Dependencies

### Core
- **next** (15.5.7) - React framework
- **next-auth** (4.24.10) - Authentication
- **@prisma/client** (6.19.1) - Database ORM
- **bcryptjs** (2.4.3) - Password hashing

### Development
- **prisma** (6.19.1) - Database tools
- **typescript** (5.6.3) - Type safety
- **ts-node** (10.9.2) - TypeScript execution

Install all with `npm install`.

---

## 🚢 Deployment

### To Vercel
```bash
# Add production environment variables in Vercel dashboard
# Then push to GitHub
git push origin main
# Vercel automatically deploys
```

### To Supabase Cloud
```bash
# Update DATABASE_URL to Supabase cloud project
# Run migrations
npx prisma db push

# Apply RLS policies via Supabase dashboard SQL editor
# Copy prisma/rls-policies.sql contents and execute
```

**No code changes required** - Production uses the same PostgreSQL + RLS setup as local.

---

## 📋 Roadmap

### Phase 1 (Current) ✅
- [x] Database schema with 23 models
- [x] Row-level security policies
- [x] NextAuth.js configuration
- [x] Seeding scripts

### Phase 2 (API Routes)
- [ ] Authentication endpoints
- [ ] SuperAdmin tenant management
- [ ] Tenant client management
- [ ] Client workspace access

### Phase 3 (Frontend)
- [ ] Login/signup pages
- [ ] Dashboard layouts
- [ ] Tenant management UI
- [ ] Client workspace UI

### Phase 4 (Polish)
- [ ] Email templates
- [ ] Error pages
- [ ] Success notifications
- [ ] Production deployment

---

## 📄 License

[Specify your license here]

---

## 💬 Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for setup issues
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design questions
3. Look at [schema.prisma](./prisma/schema.prisma) for database questions

---

## 👨‍💻 Contributing

Contributions welcome! Please follow:
1. Branch naming: `feature/description` or `fix/description`
2. Commit messages: Descriptive and concise
3. Type safety: Run `npm run type-check` before submitting
4. Format: Run `npm run format` before committing

---

**Built with ❤️ for wedding planners.**

**Status**: 🚧 In Development | **Version**: 0.1.0
