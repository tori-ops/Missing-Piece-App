-- CreateTable "task_templates"
CREATE TABLE "task_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,
    "milestone" BOOLEAN NOT NULL DEFAULT false,
    "confetti" BOOLEAN NOT NULL DEFAULT false,
    "pushOnActivate" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable "tasks"
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "activationDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "requestHelp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable "push_notifications"
CREATE TABLE "push_notifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "taskId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_templates_key_key" ON "task_templates"("key");

-- CreateIndex
CREATE INDEX "task_templates_tenantId_idx" ON "task_templates"("tenantId");

-- CreateIndex
CREATE INDEX "task_templates_section_idx" ON "task_templates"("section");

-- CreateIndex
CREATE INDEX "task_templates_category_idx" ON "task_templates"("category");

-- CreateIndex
CREATE INDEX "task_templates_importance_idx" ON "task_templates"("importance");

-- CreateIndex
CREATE INDEX "tasks_clientProfileId_idx" ON "tasks"("clientProfileId");

-- CreateIndex
CREATE INDEX "tasks_taskTemplateId_idx" ON "tasks"("taskTemplateId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_isOverdue_idx" ON "tasks"("isOverdue");

-- CreateIndex
CREATE INDEX "push_notifications_tenantId_idx" ON "push_notifications"("tenantId");

-- CreateIndex
CREATE INDEX "push_notifications_clientProfileId_idx" ON "push_notifications"("clientProfileId");

-- CreateIndex
CREATE INDEX "push_notifications_taskId_idx" ON "push_notifications"("taskId");

-- CreateIndex
CREATE INDEX "push_notifications_type_idx" ON "push_notifications"("type");

-- CreateIndex
CREATE INDEX "push_notifications_sentAt_idx" ON "push_notifications"("sentAt");

-- AddForeignKey
ALTER TABLE "task_templates" ADD CONSTRAINT "task_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "task_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
