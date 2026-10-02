-- Application history is append-only, including the evidence versions actually reviewed.
CREATE FUNCTION reject_history_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON "AuditEvent"
FOR EACH ROW EXECUTE FUNCTION reject_history_mutation();
CREATE TRIGGER transition_append_only BEFORE UPDATE OR DELETE ON "WorkflowTransition"
FOR EACH ROW EXECUTE FUNCTION reject_history_mutation();
CREATE TRIGGER evidence_append_only BEFORE UPDATE OR DELETE ON "TransitionEvidence"
FOR EACH ROW EXECUTE FUNCTION reject_history_mutation();
CREATE TRIGGER document_version_append_only BEFORE UPDATE OR DELETE ON "DocumentVersion"
FOR EACH ROW EXECUTE FUNCTION reject_history_mutation();

CREATE FUNCTION preserve_project_id() RETURNS trigger AS $$
BEGIN
  IF NEW.id <> OLD.id THEN RAISE EXCEPTION 'Project ID is immutable'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER project_id_immutable BEFORE UPDATE ON "Project"
FOR EACH ROW EXECUTE FUNCTION preserve_project_id();

CREATE FUNCTION preserve_document_identity() RETURNS trigger AS $$
BEGIN
  IF NEW.id <> OLD.id OR NEW."projectId" <> OLD."projectId" OR NEW.type <> OLD.type THEN
    RAISE EXCEPTION 'Document identity, project and evidence type are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER document_identity_immutable BEFORE UPDATE ON "Document"
FOR EACH ROW EXECUTE FUNCTION preserve_document_identity();

CREATE FUNCTION preserve_workflow_identity() RETURNS trigger AS $$
BEGIN
  IF NEW.id <> OLD.id OR NEW."projectId" <> OLD."projectId" OR NEW.kind <> OLD.kind OR NEW."definitionKey" <> OLD."definitionKey" OR NEW."definitionVersion" <> OLD."definitionVersion" THEN
    RAISE EXCEPTION 'Workflow identity, project and definition version are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER workflow_identity_immutable BEFORE UPDATE ON "WorkflowInstance"
FOR EACH ROW EXECUTE FUNCTION preserve_workflow_identity();

ALTER TABLE "Project" ADD CONSTRAINT project_version_nonnegative CHECK (version >= 0);
ALTER TABLE "Document" ADD CONSTRAINT document_version_nonnegative CHECK (version >= 0);
ALTER TABLE "DocumentVersion" ADD CONSTRAINT document_version_positive CHECK (number > 0);
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT workflow_versions_valid CHECK (version >= 0 AND "evidenceRevision" > 0 AND "definitionVersion" > 0);
ALTER TABLE "WorkflowTransition" ADD CONSTRAINT transition_versions_valid CHECK ("expectedVersion" >= 0 AND "resultingVersion" = "expectedVersion" + 1 AND "evidenceRevision" > 0);
