# ADR 0003: Shared guarded workflow service with transactional history

Date: 2026-10-02  
Status: Accepted for Module 0

Use one shared `WorkflowRegistry` and `WorkflowService` for Technical Clearance, Project Implementation, UAT/Conformity and Certification. Versioned definitions describe states, allowed role/stage, server-owned condition IDs, required document types/versions and validator IDs. Registry validation rejects contradictory authorities, unregistered checks, ambiguous transitions and external-verifier mutation roles. Definitions are copied/frozen and never supplied by an HTTP client.

Central governance checks enforce assessment → committee first recommendation → Director second recommendation → Director-General final decision for Technical Clearance and UAT/Conformity, with the appropriate assessment-team role. Prior reviews must belong to the same evidence revision. Certification requires Certification Unit authority and a server condition establishing an eligible Director-General conformity decision. Implementation requires a server condition establishing clearance eligibility. The eligibility resolvers belong to the later owning capabilities; Module 0 does not invent approval/conditional-approval policy.

Every transition validates its input, authenticated actor role, institution/project scope, allowed state pair, expected version/revision, prior review receipts, required document versions, conditions and custom validation. Changed previously reviewed evidence blocks continuation. PPA and MoF verifier roles cannot mutate even if accidentally included in an allow-list. Platform administration does not imply final-decision authority.

Persist compare-and-swap state changes, the complete transition/evidence record and a shared audit event in one PostgreSQL serializable transaction. Unique per-instance idempotency keys return the same transition for an identical authorized replay; changed actor/command replays are rejected. Concurrency conflicts return a retryable conflict without duplicate transitions.

Transition records contain current/target state, authorized role, stage, required conditions/documents, validation results, actor, timestamp, comments, audit reference, evidence revision and version numbers. Shared document-version foreign keys preserve the evidence reviewed. PostgreSQL triggers prevent updates/deletes of audit/transition/evidence/document-version history and preserve Project ID/document ownership.

No production business definitions, project CRUD, review screens or transition HTTP endpoints are exposed by Module 0. Synthetic definitions exist only in tests. Later modules register their definitions/resolvers through this shared service and add the specifically authorized commands. Returns, delegation, conditional obligations and certificate policy require their own approved specifications; the foundation fails closed when they are missing.

The development database user owns its schema for migration convenience. Production deployment will require separate migration/runtime identities, restricted database privileges, operational audit controls and policy-specific retention arrangements in later authorized work; an application migration alone is not tamper-proof against a privileged database operator.
