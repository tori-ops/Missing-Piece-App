# Delete Client Profile - Manual Instructions

**Target:** Remove client profile for `vkoleski10@gmail.com` from The Missing Piece production database

## Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Project: db.aocvndwchptpiqybnwsb
   - Table Editor

2. **Find and Delete the Client**
   - Navigate to: **SQL Editor** → **New Query**
   - Paste this SQL:
   
   ```sql
   -- Check if client exists
   SELECT id, "firstName", "lastName", email, "weddingDate", "createdAt" 
   FROM "ClientProfile" 
   WHERE email = 'vkoleski10@gmail.com';
   
   -- Run the above first to verify, then delete:
   DELETE FROM "ClientProfile" 
   WHERE email = 'vkoleski10@gmail.com';
   ```

3. **Confirm Deletion**
   - Run the SELECT query first to see details
   - Then uncomment the DELETE and run it
   - Should show "1 row affected"

## Option 2: Using psql Command Line

```bash
psql "postgresql://postgres:puZZle3m0ji!@db.aocvndwchptpiqybnwsb.supabase.co:5432/postgres" \
  -c "DELETE FROM \"ClientProfile\" WHERE email = 'vkoleski10@gmail.com';"
```

## Client Details (If Needed)

Once you run the SELECT query, you'll see:
- **Email:** vkoleski10@gmail.com
- **Created by:** tori@missingpieceplanning.com (Tenant: The Missing Piece Planning)
- **Related records:** Any Task records with this clientProfileId will be orphaned (consider deleting those too if needed)

## Optional: Also Delete Related Tasks

If you want to clean up all associated tasks:

```sql
-- Delete all tasks for this client
DELETE FROM "Task" 
WHERE "clientProfileId" IN (
  SELECT id FROM "ClientProfile" WHERE email = 'vkoleski10@gmail.com'
);

-- Then delete the client
DELETE FROM "ClientProfile" 
WHERE email = 'vkoleski10@gmail.com';
```

## Production Database Details

- **Host:** db.aocvndwchptpiqybnwsb.supabase.co
- **Port:** 5432 (or 6543 for connection pooling)
- **Database:** postgres
- **User:** postgres
- **URL:** postgresql://postgres:puZZle3m0ji!@db.aocvndwchptpiqybnwsb.supabase.co:5432/postgres
