# 🎯 Missing Piece App - Local Development Setup

Complete guide to get the app running locally with Supabase PostgreSQL.

---

## 📋 Prerequisites

- **Node.js** 18.17.0+ ([download](https://nodejs.org/))
- **npm** 9.0.0+
- **Docker** ([download](https://www.docker.com/)) - For local Supabase
- **Git** ([download](https://git-scm.com/))

Verify your installation:
```bash
node --version    # Should be v18.17.0+
npm --version     # Should be 9.0.0+
docker --version  # Should show version
```

---

## 🗄️ Step 1: Start Local Supabase

### Option A: Using Docker (Recommended)

1. **Create postgres_data directory** (for data persistence):
```bash
mkdir -p postgres_data
```

2. **Start PostgreSQL container**:
```bash
docker run -d \
  --name supabase_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 54321:5432 \
  -v $(pwd)/postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

3. **Verify connection**:
```bash
# Wait 10 seconds for container to start, then:
psql postgresql://postgres:postgres@localhost:54321/postgres -c "SELECT 1;"
```

You should see:
```
 ?column?
----------
        1
(1 row)
```

### Option B: Using Supabase CLI

```bash
npm install -g supabase

supabase start
# Follow prompts; note the API URL and anon key
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

---

## ⚙️ Step 3: Configure Environment

1. **Copy template to .env.local**:
```bash
cp .env.example .env.local
```

2. **Fill in .env.local** with your values:

```env
# Database (local Supabase)
DATABASE_URL="postgresql://postgres:postgres@localhost:54321/postgres"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-specific-password"  # NOT your Gmail password!
EMAIL_FROM="noreply@missingpiece.local"

# Supabase (local development - optional for storage)
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-key-for-local"
SUPABASE_SERVICE_ROLE_KEY="dummy-key-for-local"

# OAuth (leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET in .env.local
```

### Get Gmail SMTP Password:
1. Enable 2-Factor Authentication in Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy 16-character password to SMTP_PASS

---

## 🗂️ Step 4: Apply Database Schema

### Push schema to local database:
```bash
npm run prisma:db-push
```

You'll be asked if you want to "create the database". Answer **yes**.

### Verify tables were created:
```bash
psql postgresql://postgres:postgres@localhost:54321/postgres -c "\dt"
```

You should see tables like: users, tenants, client_profiles, sessions, etc.

---

## 🔒 Step 5: Apply Row-Level Security (RLS) Policies

1. **Open Supabase SQL Editor** (if using Supabase CLI):
```bash
supabase studio
```
Then navigate to SQL Editor tab.

2. **Or connect directly with psql**:
```bash
psql postgresql://postgres:postgres@localhost:54321/postgres
```

3. **Copy-paste entire contents of `prisma/rls-policies.sql`** and execute.

4. **Verify RLS is enabled**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE rowsecurity = true 
ORDER BY tablename;
```

Should show ~12 tables with RLS enabled.

---

## 🌱 Step 6: Seed Test Data

Populate the database with test accounts:

```bash
npm run prisma:seed
```

This creates:
- **SUPERADMIN**: superadmin@missingpiece.local / SuperAdmin123!
- **TENANT**: sarah@eliteweddings.local / TenantPassword123!
- **CLIENT**: emma@example.local or james@example.local / ClientPassword123!

---

## 🚀 Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Authentication

### Test SUPERADMIN Login:
```
Email: superadmin@missingpiece.local
Password: SuperAdmin123!
```

Expected: Redirects to SuperAdmin dashboard (tenant list, analytics)

### Test TENANT Login:
```
Email: sarah@eliteweddings.local
Password: TenantPassword123!
```

Expected: Redirects to tenant dashboard (client management, subscription info)

### Test CLIENT Login:
```
Email: emma@example.local
Password: ClientPassword123!
```

Expected: Redirects to client workspace (wedding planning)

---

## 📊 Useful Commands

```bash
# View Prisma schema in browser UI
npm run prisma:studio

# Open Supabase Studio (if using CLI)
supabase studio

# Run migrations
npm run prisma:migrate

# Check TypeScript errors
npm run type-check

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

---

## 🐛 Troubleshooting

### "Connection refused" error
```bash
# Check if Docker container is running
docker ps | grep supabase_postgres

# If not, restart:
docker start supabase_postgres
```

### "Database does not exist" error
```bash
# Recreate database
npx prisma db push
```

### "RLS policy syntax error"
- Copy-paste `rls-policies.sql` line-by-line
- Check PostgreSQL version is 12+

### "NextAuth secret not set"
```bash
# Generate and add to .env.local
openssl rand -base64 32
```

---

## 📝 Next Steps

1. ✅ Database: Schema + RLS policies applied
2. ✅ Auth: NextAuth configured in `src/lib/auth.ts`
3. ⏳ **API Routes**: Create endpoints for tenant/client creation
4. ⏳ **Pages**: Login, dashboard, profile management
5. ⏳ **Email Templates**: Verification, password reset, invites

---

## 🔐 Security Notes

- **Never** commit `.env.local` to Git (included in `.gitignore`)
- **Always** use HTTPS in production
- **Rotate** NEXTAUTH_SECRET before deploying to production
- **Use** RLS policies (enabled in this setup) - app layer is second line of defense
- **Hash passwords** at 12 rounds for SUPERADMIN, 10 for others (configured in `src/lib/auth.ts`)

---

## 📞 Support

For issues, check:
1. `.env.local` has all required values
2. Docker container is running (`docker ps`)
3. Database connection works (`psql --version`)
4. RLS policies are applied (`SELECT * FROM pg_policies;`)

---

**Good luck! 🎉**
