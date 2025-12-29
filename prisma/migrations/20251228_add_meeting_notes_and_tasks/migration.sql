-- CreateEnum
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskAssigneeType" AS ENUM ('TENANT', 'CLIENT');

-- CreateEnum
CREATE TYPE "TaskSource" AS ENUM ('MANUAL', 'MEETING_NOTE');

-- CreateTable
CREATE TABLE "meeting_notes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingDate" TIMESTAMP(3),
    "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
    "attachmentPath" TEXT,
    "ocrStatus" "OCRStatus" NOT NULL DEFAULT 'PENDING',
    "ocrError" TEXT,

    CONSTRAINT "meeting_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigneeType" "TaskAssigneeType" NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "source" "TaskSource" NOT NULL DEFAULT 'MANUAL',
    "meetingNoteId" TEXT,
    "taskGroupId" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_notes_tenantId_idx" ON "meeting_notes"("tenantId");

-- CreateIndex
CREATE INDEX "meeting_notes_clientId_idx" ON "meeting_notes"("clientId");

-- CreateIndex
CREATE INDEX "meeting_notes_createdAt_idx" ON "meeting_notes"("createdAt");

-- CreateIndex
CREATE INDEX "meeting_notes_meetingDate_idx" ON "meeting_notes"("meetingDate");

-- CreateIndex
CREATE INDEX "meeting_notes_ocrStatus_idx" ON "meeting_notes"("ocrStatus");

-- CreateIndex
CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");

-- CreateIndex
CREATE INDEX "tasks_clientId_idx" ON "tasks"("clientId");

-- CreateIndex
CREATE INDEX "tasks_assigneeType_idx" ON "tasks"("assigneeType");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_meetingNoteId_idx" ON "tasks"("meetingNoteId");

-- CreateIndex
CREATE INDEX "tasks_taskGroupId_idx" ON "tasks"("taskGroupId");

-- AddForeignKey
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "meeting_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "meeting_note_attachments" (
    "id" TEXT NOT NULL,
    "meetingNoteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_note_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "taskId" TEXT,
    "commentId" TEXT,
    "meetingNoteId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_note_attachments_meetingNoteId_idx" ON "meeting_note_attachments"("meetingNoteId");

-- CreateIndex
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");

-- CreateIndex
CREATE INDEX "task_comments_createdByUserId_idx" ON "task_comments"("createdByUserId");

-- CreateIndex
CREATE INDEX "task_comments_createdAt_idx" ON "task_comments"("createdAt");

-- CreateIndex
CREATE INDEX "notification_logs_recipientUserId_idx" ON "notification_logs"("recipientUserId");

-- CreateIndex
CREATE INDEX "notification_logs_notificationType_idx" ON "notification_logs"("notificationType");

-- CreateIndex
CREATE INDEX "notification_logs_taskId_idx" ON "notification_logs"("taskId");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "meeting_note_attachments" ADD CONSTRAINT "meeting_note_attachments_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "meeting_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "task_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "meeting_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
