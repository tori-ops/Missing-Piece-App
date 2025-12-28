-- Skip enum creation (they already exist)
-- Just create the tables and indices

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
CREATE INDEX "meeting_notes_clientId_idx" ON "meeting_notes"("clientId");
CREATE INDEX "meeting_notes_createdAt_idx" ON "meeting_notes"("createdAt");
CREATE INDEX "meeting_notes_meetingDate_idx" ON "meeting_notes"("meetingDate");
CREATE INDEX "meeting_notes_ocrStatus_idx" ON "meeting_notes"("ocrStatus");

CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");
CREATE INDEX "tasks_clientId_idx" ON "tasks"("clientId");
CREATE INDEX "tasks_assigneeType_idx" ON "tasks"("assigneeType");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");
CREATE INDEX "tasks_meetingNoteId_idx" ON "tasks"("meetingNoteId");
CREATE INDEX "tasks_taskGroupId_idx" ON "tasks"("taskGroupId");

-- AddForeignKey
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_meetingNoteId_fkey" FOREIGN KEY ("meetingNoteId") REFERENCES "meeting_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
