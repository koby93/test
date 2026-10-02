-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkflowKind" AS ENUM ('TECHNICAL_CLEARANCE', 'PROJECT_IMPLEMENTATION', 'UAT_CONFORMITY', 'CERTIFICATION');

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "objectKey" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "kind" "WorkflowKind" NOT NULL,
    "definitionKey" TEXT NOT NULL,
    "definitionVersion" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "evidenceRevision" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "projectId" UUID,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
    "id" UUID NOT NULL,
    "instanceId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "currentState" TEXT NOT NULL,
    "targetState" TEXT NOT NULL,
    "authorizedRole" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "requiredConditions" JSONB NOT NULL,
    "requiredDocuments" JSONB NOT NULL,
    "validation" JSONB NOT NULL,
    "actorId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT NOT NULL,
    "auditReference" UUID NOT NULL,
    "evidenceRevision" INTEGER NOT NULL,
    "expectedVersion" INTEGER NOT NULL,
    "resultingVersion" INTEGER NOT NULL,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransitionEvidence" (
    "transitionId" UUID NOT NULL,
    "documentVersionId" UUID NOT NULL,

    CONSTRAINT "TransitionEvidence_pkey" PRIMARY KEY ("transitionId","documentVersionId")
);

-- CreateIndex
CREATE INDEX "Project_institutionId_idx" ON "Project"("institutionId");

-- CreateIndex
CREATE INDEX "Document_projectId_type_idx" ON "Document"("projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_objectKey_key" ON "DocumentVersion"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_number_key" ON "DocumentVersion"("documentId", "number");

-- CreateIndex
CREATE INDEX "WorkflowInstance_projectId_kind_idx" ON "WorkflowInstance"("projectId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInstance_id_projectId_key" ON "WorkflowInstance"("id", "projectId");

-- CreateIndex
CREATE INDEX "AuditEvent_projectId_timestamp_idx" ON "AuditEvent"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditEvent_correlationId_idx" ON "AuditEvent"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTransition_auditReference_key" ON "WorkflowTransition"("auditReference");

-- CreateIndex
CREATE INDEX "WorkflowTransition_projectId_timestamp_idx" ON "WorkflowTransition"("projectId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTransition_instanceId_requestId_key" ON "WorkflowTransition"("instanceId", "requestId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_instanceId_projectId_fkey" FOREIGN KEY ("instanceId", "projectId") REFERENCES "WorkflowInstance"("id", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT "WorkflowTransition_auditReference_fkey" FOREIGN KEY ("auditReference") REFERENCES "AuditEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransitionEvidence" ADD CONSTRAINT "TransitionEvidence_transitionId_fkey" FOREIGN KEY ("transitionId") REFERENCES "WorkflowTransition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransitionEvidence" ADD CONSTRAINT "TransitionEvidence_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "DocumentVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

