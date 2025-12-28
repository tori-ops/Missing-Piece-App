-- Add venue fields to client_profiles table for Google Places integration
ALTER TABLE "client_profiles" ADD COLUMN "venueLat" DOUBLE PRECISION;
ALTER TABLE "client_profiles" ADD COLUMN "venueLng" DOUBLE PRECISION;
ALTER TABLE "client_profiles" ADD COLUMN "venuePhone" TEXT;
ALTER TABLE "client_profiles" ADD COLUMN "venueWebsite" TEXT;
