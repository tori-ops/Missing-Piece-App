/*
  Warnings:

  - You are about to drop the `_ClientProfileToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `email` on the `client_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `overallBudgetCents` on the `client_profiles` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `client_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_ClientProfileToUser_B_index";

-- DropIndex
DROP INDEX "_ClientProfileToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ClientProfileToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "tenant_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedByClientUserId" TEXT,
    CONSTRAINT "tenant_access_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "client_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenant_access_grantedByClientUserId_fkey" FOREIGN KEY ("grantedByClientUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_client_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "couple1FirstName" TEXT NOT NULL,
    "couple1LastName" TEXT NOT NULL,
    "couple2FirstName" TEXT,
    "couple2LastName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "weddingDate" DATETIME,
    "weddingLocation" TEXT,
    "budgetCents" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "client_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "client_profiles_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_client_profiles" ("couple1FirstName", "couple1LastName", "couple2FirstName", "couple2LastName", "createdAt", "createdByUserId", "id", "phone", "status", "tenantId", "updatedAt", "weddingDate") SELECT "couple1FirstName", "couple1LastName", "couple2FirstName", "couple2LastName", "createdAt", "createdByUserId", "id", "phone", "status", "tenantId", "updatedAt", "weddingDate" FROM "client_profiles";
DROP TABLE "client_profiles";
ALTER TABLE "new_client_profiles" RENAME TO "client_profiles";
CREATE UNIQUE INDEX "client_profiles_contactEmail_key" ON "client_profiles"("contactEmail");
CREATE INDEX "client_profiles_tenantId_idx" ON "client_profiles"("tenantId");
CREATE INDEX "client_profiles_contactEmail_idx" ON "client_profiles"("contactEmail");
CREATE INDEX "client_profiles_status_idx" ON "client_profiles"("status");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL,
    "accountStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "emailVerified" DATETIME,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" DATETIME,
    "lastLoginAt" DATETIME,
    "lastLoginIp" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "tenantId" TEXT,
    "clientId" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorMethod" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorVerifiedAt" DATETIME,
    "backupCodes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("accountStatus", "avatar", "backupCodes", "createdAt", "email", "emailVerificationExpires", "emailVerificationToken", "emailVerified", "failedLoginAttempts", "firstName", "id", "isActive", "lastLoginAt", "lastLoginIp", "lastName", "lockedUntil", "mustChangePassword", "passwordChangedAt", "passwordHash", "passwordResetExpires", "passwordResetToken", "phone", "role", "tenantId", "twoFactorEnabled", "twoFactorMethod", "twoFactorSecret", "twoFactorVerifiedAt", "updatedAt") SELECT "accountStatus", "avatar", "backupCodes", "createdAt", "email", "emailVerificationExpires", "emailVerificationToken", "emailVerified", "failedLoginAttempts", "firstName", "id", "isActive", "lastLoginAt", "lastLoginIp", "lastName", "lockedUntil", "mustChangePassword", "passwordChangedAt", "passwordHash", "passwordResetExpires", "passwordResetToken", "phone", "role", "tenantId", "twoFactorEnabled", "twoFactorMethod", "twoFactorSecret", "twoFactorVerifiedAt", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_clientId_idx" ON "users"("clientId");
CREATE INDEX "users_accountStatus_idx" ON "users"("accountStatus");
CREATE INDEX "users_role_idx" ON "users"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "tenant_access_clientProfileId_idx" ON "tenant_access"("clientProfileId");

-- CreateIndex
CREATE INDEX "tenant_access_tenantId_idx" ON "tenant_access"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_access_clientProfileId_tenantId_key" ON "tenant_access"("clientProfileId", "tenantId");
