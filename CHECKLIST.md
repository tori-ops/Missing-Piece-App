# ✅ Project Setup Checklist

Complete checklist for building and deploying Missing Piece App.

---

## 📋 Phase 0: Prerequisites (Do These First)

- [ ] Node.js 18.17.0+ installed (`node --version`)
- [ ] npm 9.0.0+ installed (`npm --version`)
- [ ] Docker installed for Supabase (`docker --version`)
- [ ] Git installed (`git --version`)
- [ ] Text editor (VS Code recommended)
- [ ] GitHub account (for OAuth testing, optional)
- [ ] Gmail account with app password setup (for email testing)

---

## 🏗️ Phase 1: Local Setup (45 minutes)

### 1.1 Database
- [ ] Start Docker Supabase PostgreSQL container
  ```bash
  docker run -d --name supabase_postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=postgres \
    -p 54321:5432 \
    postgres:16-alpine
  ```
- [ ] Verify connection: `psql postgresql://postgres:postgres@localhost:54321/postgres -c "SELECT 1;"`

### 1.2 Dependencies
- [ ] Install npm packages: `npm install`
- [ ] Verify Prisma: `npm run prisma:generate`

### 1.3 Configuration
- [ ] Copy `.env.example` to `.env.local`: `cp .env.example .env.local`
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Add NEXTAUTH_SECRET to `.env.local`
- [ ] Set EMAIL_FROM in `.env.local`
- [ ] Set NEXTAUTH_URL to `http://localhost:3000`
- [ ] Fill in SMTP credentials (Gmail app password)
- [ ] Leave OAuth fields empty for now

### 1.4 Database Schema
- [ ] Push schema to database: `npm run prisma:db-push`
- [ ] Verify tables created: `psql postgresql://postgres:postgres@localhost:54321/postgres -c "\dt"`
- [ ] Should see ~23 tables (users, tenants, client_profiles, etc.)

### 1.5 Row-Level Security
- [ ] Connect to database: `psql postgresql://postgres:postgres@localhost:54321/postgres`
- [ ] Apply RLS policies: `\i prisma/rls-policies.sql`
- [ ] Verify RLS enabled: `SELECT tablename FROM pg_tables WHERE rowsecurity = true ORDER BY tablename;`
- [ ] Should show ~12 tables

### 1.6 Test Data
- [ ] Seed database: `npm run prisma:seed`
- [ ] Verify success message with test credentials

### 1.7 Start Development
- [ ] Run dev server: `npm run dev`
- [ ] Open http://localhost:3000 in browser
- [ ] Verify page loads without errors

---

## 🧪 Phase 2: Authentication Testing (30 minutes)

### 2.1 SUPERADMIN Login
- [ ] Navigate to login page
- [ ] Enter: `superadmin@missingpiece.local` / `SuperAdmin123!`
- [ ] Verify: Logs in and redirects (dashboard not yet built)
- [ ] Check console: No auth errors

### 2.2 TENANT Login
- [ ] Logout and navigate to login
- [ ] Enter: `sarah@eliteweddings.local` / `TenantPassword123!`
- [ ] Verify: Logs in successfully
- [ ] Check JWT in session: Should include role=TENANT, tenantId

### 2.3 CLIENT Login
- [ ] Logout and navigate to login
- [ ] Enter: `emma@example.local` / `ClientPassword123!`
- [ ] Verify: Logs in successfully
- [ ] Check JWT: Should include role=CLIENT, clientProfileId

### 2.4 Failed Login
- [ ] Enter wrong password
- [ ] Verify: Shows error message
- [ ] Try 5 times quickly
- [ ] Verify: Account soft-locked for 30 minutes
- [ ] Check audit log: Failed attempts recorded

### 2.5 Session Behavior
- [ ] Login with one account
- [ ] Login with another account in different browser tab
- [ ] Verify: First session logged out (only one per user)

---

## 🏢 Phase 3: API Routes Development (Weekly)

### Week 1: Authentication APIs
- [ ] `/api/auth/signup` - Email signup
- [ ] `/api/auth/verify-email` - Email verification
- [ ] `/api/auth/password-reset` - Password reset request
- [ ] `/api/auth/password-reset-confirm` - Password reset confirmation
- [ ] `/api/auth/2fa/setup` - 2FA setup endpoint
- [ ] `/api/auth/2fa/verify` - 2FA verification

### Week 2: SuperAdmin APIs
- [ ] `GET /api/superadmin/tenants` - List tenants
- [ ] `POST /api/superadmin/tenants` - Create tenant
- [ ] `GET /api/superadmin/payments` - Revenue dashboard
- [ ] `GET /api/superadmin/audit-logs` - Audit log viewer

### Week 3: Tenant APIs
- [ ] `GET /api/tenant/profile` - Get business profile
- [ ] `PUT /api/tenant/profile` - Update profile
- [ ] `GET /api/tenant/clients` - List clients
- [ ] `POST /api/tenant/clients` - Create client
- [ ] `GET/POST /api/tenant/invite-codes` - Manage invite codes

### Week 4: Client & Account APIs
- [ ] `GET /api/client/profile` - Get wedding profile
- [ ] `PUT /api/client/profile` - Update profile
- [ ] `GET /api/account/profile` - Get user profile
- [ ] `POST /api/account/password-change` - Change password
- [ ] `GET/POST /api/account/2fa/*` - 2FA management

---

## 🎨 Phase 4: Frontend Development (4 Weeks)

### Login & Auth Pages
- [ ] Login page with email/password form
- [ ] Signup page with registration form
- [ ] Email verification page
- [ ] Password reset request page
- [ ] Password reset form page
- [ ] 2FA setup wizard
- [ ] 2FA verification form
- [ ] OAuth button integration (Google, Apple, Facebook)

### SuperAdmin Dashboard
- [ ] Tenant list with sorting/filtering
- [ ] Tenant creation modal
- [ ] Revenue dashboard with charts
- [ ] Audit log viewer with filters
- [ ] User management (lock/unlock accounts)
- [ ] Analytics page (metrics, graphs)

### Tenant Dashboard
- [ ] Business profile view/edit
- [ ] Client list with actions
- [ ] Client creation form
- [ ] Invite code generator
- [ ] Payment history
- [ ] Subscription status
- [ ] User management

### Client Workspace
- [ ] Wedding profile view/edit
- [ ] Couple information
- [ ] Budget management
- [ ] Timeline/planning features
- [ ] Guest list management
- [ ] Vendor tracking

### Account/Settings Pages (All Roles)
- [ ] Profile management
- [ ] Password change
- [ ] 2FA setup/disable
- [ ] Device management
- [ ] Session management
- [ ] OAuth account linking

---

## 📧 Phase 5: Email Templates (1 Week)

- [ ] Welcome email (signup confirmation)
- [ ] Email verification email
- [ ] Password reset email
- [ ] 2FA code email
- [ ] Invite code email
- [ ] Subscription renewal reminder
- [ ] Payment receipt email
- [ ] Account locked alert

---

## 🔐 Phase 6: Security Hardening (1 Week)

### Database Security
- [ ] Verify all RLS policies enabled (`SELECT * FROM pg_policies;`)
- [ ] Verify context variables set before queries
- [ ] Test that tenant A cannot see tenant B's data
- [ ] Test that CLIENT cannot see non-own profiles
- [ ] Test that SUPERADMIN cannot see client details

### Application Security
- [ ] Enable CORS for known domains only
- [ ] Implement rate limiting on login endpoint
- [ ] Verify password hashing (12 rounds SUPERADMIN, 10 others)
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy headers
- [ ] Test SQL injection prevention (Prisma handles this)
- [ ] Verify httpOnly cookies for sessions

### Audit & Compliance
- [ ] Verify all actions logged to AuditLog
- [ ] Verify failed logins tracked in LoginAttempt
- [ ] Verify 730-day retention policy
- [ ] Test audit log filtering by user/tenant/date

---

## 🚀 Phase 7: Production Deployment (1 Week)

### Supabase Cloud Setup
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Note: API URL, anon key, service role key
- [ ] Create database (PostgreSQL)
- [ ] Get connection string

### Database Migration
- [ ] Update DATABASE_URL to Supabase cloud
- [ ] Run migrations: `npx prisma db push`
- [ ] Verify tables created in cloud
- [ ] Apply RLS policies via Supabase SQL editor
- [ ] Seed production data (create SUPERADMIN account)
- [ ] Test production database access

### Vercel Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel:
  - [ ] DATABASE_URL (Supabase cloud)
  - [ ] NEXTAUTH_SECRET (generate new for production)
  - [ ] NEXTAUTH_URL (production domain)
  - [ ] SMTP credentials
  - [ ] OAuth credentials (Google, Apple, Facebook)
  - [ ] Supabase credentials (public + service role)
- [ ] Deploy to Vercel: `git push origin main`
- [ ] Verify deployment successful
- [ ] Test login on production URL

### Domain & DNS
- [ ] Register domain (e.g., missingpiece.app)
- [ ] Configure DNS to point to Vercel
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Generate new SSL certificate (Vercel handles auto)

### Monitoring & Backups
- [ ] Setup Vercel analytics dashboard
- [ ] Setup Supabase backups (automatic)
- [ ] Configure error tracking (Sentry, optional)
- [ ] Setup uptime monitoring
- [ ] Configure log aggregation

---

## 🎯 Phase 8: Launch Readiness (1 Week)

### Testing
- [ ] User acceptance testing (UAT) checklist complete
- [ ] Load testing on staging
- [ ] Security penetration testing
- [ ] Browser compatibility testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile responsiveness testing
- [ ] Email delivery testing (check spam folder)

### Documentation
- [ ] User documentation complete
- [ ] Admin guide complete
- [ ] API documentation complete
- [ ] Runbook for common issues
- [ ] Incident response procedures

### Marketing & Communication
- [ ] Landing page ready
- [ ] Email templates for launch
- [ ] Social media posts scheduled
- [ ] Press release prepared
- [ ] Onboarding documentation for first customers

### Go-Live
- [ ] All team approval obtained
- [ ] Production monitoring active
- [ ] Support team trained
- [ ] Marketing team ready
- [ ] CEO approval for launch

---

## 📊 Ongoing Maintenance

### Weekly
- [ ] Review audit logs for suspicious activity
- [ ] Check error tracking (Sentry, etc.)
- [ ] Monitor database performance
- [ ] Update dependencies (minor versions)

### Monthly
- [ ] Review subscription renewals
- [ ] Analyze revenue metrics
- [ ] Check user growth trends
- [ ] Update major dependencies
- [ ] Security patch review

### Quarterly
- [ ] Penetration testing
- [ ] Database optimization review
- [ ] Architecture review for scalability
- [ ] Customer feedback analysis
- [ ] Roadmap planning

### Annually
- [ ] Full security audit
- [ ] Compliance review (GDPR, etc.)
- [ ] Performance benchmarking
- [ ] Technology stack review

---

## 🚨 Critical Reminders

🔒 **SECURITY**
- Never commit `.env.local` to Git (in `.gitignore`)
- Never share NEXTAUTH_SECRET
- Always use HTTPS in production
- Rotate secrets before deploying
- Keep dependencies updated

📊 **DATABASE**
- Always backup before schema changes
- Test migrations on staging first
- Verify RLS policies applied
- Monitor database size growth
- Archive old audit logs (after 730 days)

🚀 **DEPLOYMENT**
- Build locally before pushing: `npm run build`
- Run type check: `npm run type-check`
- Test in staging before production
- Have rollback plan ready
- Monitor errors in production

---

## 🎉 Success Criteria

Project is considered complete when:

- ✅ Database schema applied (23 models, all relationships)
- ✅ RLS policies enforced (30+ policies, 3 access tiers)
- ✅ Authentication working (email, OAuth, 2FA)
- ✅ All API routes implemented
- ✅ Frontend pages built and styled
- ✅ Email delivery working
- ✅ Audit logging complete
- ✅ Security hardened and tested
- ✅ Deployed to production
- ✅ Monitoring and alerts configured
- ✅ Documentation complete
- ✅ Team trained and ready

---

## 📞 Need Help?

1. Check [SETUP.md](./SETUP.md) for environment setup issues
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design questions
3. See [schema.prisma](./prisma/schema.prisma) for database structure
4. Consult [rls-policies.sql](./prisma/rls-policies.sql) for security policies

---

**Last Updated**: [Current Date]  
**Version**: 0.1.0  
**Status**: 🚧 In Development
