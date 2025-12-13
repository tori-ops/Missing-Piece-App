/*
  Warnings:

  - Added the required column `primary_email` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "primary_email" TEXT NOT NULL,
    "webAddress" TEXT NOT NULL,
    "weddingDate" DATETIME,
    "budget" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionStartDate" DATETIME,
    "subscriptionEndDate" DATETIME,
    "notificationSentAt30Days" DATETIME,
    "notificationSentAt2Weeks" DATETIME,
    "adminNotes" TEXT,
    "brandingPrimaryColor" TEXT DEFAULT '#274E13',
    "brandingSecondaryColor" TEXT DEFAULT '#D0CEB5',
    "brandingSecondaryColorOpacity" INTEGER DEFAULT 55,
    "brandingFontColor" TEXT DEFAULT '#000000',
    "brandingLogoUrl" TEXT,
    "brandingLogoBackgroundRemoval" BOOLEAN DEFAULT false,
    "brandingCompanyName" TEXT,
    "brandingTagline" TEXT,
    "brandingFaviconUrl" TEXT,
    "brandingFooterText" TEXT,
    "brandingFontFamily" TEXT DEFAULT '''Poppins'', sans-serif',
    "brandingHeaderFontFamily" TEXT DEFAULT '''Playfair Display'', serif',
    "brandingBodyFontFamily" TEXT DEFAULT '''Poppins'', sans-serif',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_tenants" ("adminNotes", "brandingBodyFontFamily", "brandingCompanyName", "brandingFaviconUrl", "brandingFontColor", "brandingFontFamily", "brandingFooterText", "brandingHeaderFontFamily", "brandingLogoBackgroundRemoval", "brandingLogoUrl", "brandingPrimaryColor", "brandingSecondaryColor", "brandingSecondaryColorOpacity", "brandingTagline", "budget", "businessName", "createdAt", "email", "firstName", "id", "isActive", "lastName", "notificationSentAt2Weeks", "notificationSentAt30Days", "phone", "status", "subscriptionEndDate", "subscriptionStartDate", "subscriptionTier", "updatedAt", "webAddress", "weddingDate") SELECT "adminNotes", "brandingBodyFontFamily", "brandingCompanyName", "brandingFaviconUrl", "brandingFontColor", "brandingFontFamily", "brandingFooterText", "brandingHeaderFontFamily", "brandingLogoBackgroundRemoval", "brandingLogoUrl", "brandingPrimaryColor", "brandingSecondaryColor", "brandingSecondaryColorOpacity", "brandingTagline", "budget", "businessName", "createdAt", "email", "firstName", "id", "isActive", "lastName", "notificationSentAt2Weeks", "notificationSentAt30Days", "phone", "status", "subscriptionEndDate", "subscriptionStartDate", "subscriptionTier", "updatedAt", "webAddress", "weddingDate" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");
CREATE UNIQUE INDEX "tenants_primary_email_key" ON "tenants"("primary_email");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");
CREATE INDEX "tenants_subscriptionTier_idx" ON "tenants"("subscriptionTier");
CREATE INDEX "tenants_email_idx" ON "tenants"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
