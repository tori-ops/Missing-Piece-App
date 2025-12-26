-- Remove wedding date and budget fields from Tenant
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "weddingDate";
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "budget";

-- Add address fields to Tenant
ALTER TABLE "Tenant" ADD COLUMN "streetAddress" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "city" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "state" TEXT;
