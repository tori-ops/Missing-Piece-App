-- Make optional fields nullable
ALTER TABLE "tenants" ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE "tenants" ALTER COLUMN "lastName" DROP NOT NULL;
ALTER TABLE "tenants" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "tenants" ALTER COLUMN "webAddress" DROP NOT NULL;
