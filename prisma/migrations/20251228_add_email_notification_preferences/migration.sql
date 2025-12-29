-- AlterTable
ALTER TABLE "notification_preferences" ADD COLUMN "emailOnTaskCreated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailOnTaskCompleted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailOnTaskCommented" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailOnMeetingNoteCreated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailOnMeetingNoteCommented" BOOLEAN NOT NULL DEFAULT true;
