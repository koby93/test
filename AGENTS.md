# Permanent project instructions

These instructions apply throughout this repository to every developer and coding agent. Read this file and the relevant architecture and workflow documents before making changes. More specific instructions may add detail but must not weaken these project rules. A later explicit instruction from the project owner takes precedence; record any resulting architecture change in an architecture decision record (ADR).

## Purpose and current scope

Build the **NITA Technical Clearance and Conformity Management System**, one integrated application for the complete lifecycle of government ICT projects.

The current development scope is **Module 0 — Core Platform and Architecture**, authorized on 2 October 2026. Implement the requested Next.js/NestJS/PostgreSQL/Prisma/Redis/MinIO foundation, shared contracts, workflow engine and its tests. Do not implement Modules 1–14 prematurely. Implement subsequent work only within the scope of the current development task; an entry in the roadmap is not authorization to implement that module.

## Non-negotiable architecture

1. Maintain **one application and one repository**. Modules are internal capabilities, not independent applications, portals with separate backends, or repositories.
2. Use a **modular monolith** as the initial application architecture: one application composition root and release, explicit internal boundaries, and common platform services. Supporting infrastructure or workers must belong to the same product and must not create separate module applications.
3. Use **one authoritative, immutable Project ID** for the entire lifecycle. The project registry owns project creation; clearance, implementation, UAT, conformity, certification, documents, tasks, verification and audit reference the same ID. Application numbers, certificate numbers and external references may exist but never replace the Project ID or create duplicate project masters.
4. Use **one integrated database architecture**, one coordinated migration history, and enforced relationships to the project master. Logical tables or namespaces may reflect module ownership; do not introduce a database per module. File bytes may use common object storage; their metadata, versions and project relationships remain in the integrated data model.
5. Reuse **common authentication and role-based access control (RBAC)**. Enforce role, institution, project scope and workflow permission on the server. Default to denial; never rely on hidden buttons as access control.
6. Reuse **common document management** for metadata, storage access, versioning, classification, retention and evidence links. Do not store authoritative documents independently in individual modules.
7. Reuse **one common workflow engine** for transition guards, sequential review, conditions, assignments, return for revision and decision history. Modules may define workflows through the shared engine; they must not implement competing state machines.
8. Reuse **one common audit trail**. Preserve append-only actor, role, institution, action, Project ID where applicable, time, record/version, result and correlation context. Capture decisions, transitions, sensitive access and external verification. Ordinary users and administrators must not rewrite audit history.
9. Reuse **one common API architecture**: versioned contracts, authentication, authorization, validation, errors, pagination, correlation IDs and integration conventions. Internal module boundaries do not justify separate public applications.
10. Treat the **Certification System as Module 7 within this integrated product**. Its register and issuance function reuse the project master and platform services. Any future connection to an existing certification service requires an ADR and must preserve these rules.

## Official lifecycle

**Technical Clearance → Project Implementation → UAT and Technical Conformity → Certificate of Conformity.**

Technical Clearance is the pre-implementation decision. It does not constitute a final conformity decision or a Certificate of Conformity. The certificate records conformity following implementation and assessment. Keep lifecycle phase, review stage, decision outcome, condition status and certificate status distinct.

### Technical Clearance approval hierarchy

| Order | Responsible authority | Required action |
| --- | --- | --- |
| 1 | Technical Working Group | Assess the submission and prepare the technical assessment report and recommendation. |
| 2 | Technical Clearance Committee | Conduct the **first review/recommendation**. |
| 3 | Director, Technical Services | Conduct the **second review/recommendation** for the Director-General. |
| 4 | Director-General | Make the **final Technical Clearance decision**. |

Only the Director-General makes the final decision: approve, approve with conditions, or deny. A report, committee recommendation or Director's recommendation must never be represented as final clearance. Record the decision and conditions, update the register, and communicate the outcome through the common services.

### Project Implementation

The institution submits a detailed implementation plan. NITA reviews its alignment with the clearance decision and conditions, provides guidance, and records milestone oversight and status updates. Implementation eligibility must follow the recorded clearance decision and any conditions that block progression. Oversight does not grant conformity or issue a certificate.

### Technical Conformity approval hierarchy

| Order | Responsible authority | Required action |
| --- | --- | --- |
| 1 | Technical Assessment/UAT Team | Assess implementation and UAT evidence and prepare the conformity assessment report and recommendation. |
| 2 | Technical Clearance Committee | Conduct the **first review/recommendation**. |
| 3 | Director, Technical Services | Conduct the **second review/recommendation** for the Director-General. |
| 4 | Director-General | Make the **final conformity decision**. |
| 5 | Certification Unit | Following an eligible final decision, issue the **Certificate of Conformity through the Certification System**. |

The institution submits a UAT plan and test scripts; NITA reviews the plan before joint institution/NITA testing. Preserve test evidence, findings, outstanding issues and the assessment report. A passed test, an approved UAT plan or a committee recommendation must not become final conformity approval.

Director-General conformity outcomes are approval, approval with conditions, or a requirement for further action, as shown in the supplied workflow. The Certification Unit validates the recorded decision and issuance eligibility, prepares certificate details, issues the certificate and updates the certification register. Do not merge the Director-General decision and certificate issuance into one actor or transition. Record certificate scope, conditions, validity and status. The supplied workflow places final sign-off/go-live after certification, where applicable.

### Transition integrity and evidence

- Enforce the hierarchy server-side, in the shared workflow engine, for UI, API, administrative and integration actions. Never provide a silent bypass or automatic final decision.
- Bind each review and decision to the submission/report/document versions actually reviewed. A material revision starts the affected review cycle again; preserve prior recommendations and decisions.
- Capture actor identity, assigned authority, recommendation or decision, reason, evidence, conditions and timestamp. System administration alone does not confer review, final-decision or issuance authority.
- Represent conditions explicitly, including whether they block progression or issuance. Do not treat conditional approval as unconditional success; ambiguous blocking rules remain an open policy decision until defined.
- Define valid returns for revision, reassessment and exceptional transitions before implementing them. They must preserve decision history and must not invent an alternative approval hierarchy.
- Use concurrency controls and idempotent commands so repeated requests cannot duplicate decisions or certificates. Persist decision/transition changes and their audit records transactionally.

## External verification: strictly read-only

| Institution | Technical Clearance verification | Certificate of Conformity verification | Decision/record mutation |
| --- | --- | --- | --- |
| Public Procurement Authority (PPA) | Allowed | **Not allowed** | **Not allowed** |
| Ministry of Finance (MoF) | Allowed | Allowed | **Not allowed** |

External verification is a scoped view of NITA's authoritative records. It cannot create or amend projects, upload or replace evidence, approve, deny, change conditions, advance workflows, issue/revoke certificates, or modify NITA decisions. Do not implement separate PPA or MoF applications or independent verification databases.

Apply permissions to every access path, including direct API requests, search, exports, downloads and integrations. Return only the fields needed for the authorized verification purpose. Do not expose internal reports, personal data or certificate details to PPA through a generic project endpoint. Distinguish approved, conditional, denied, pending and unavailable records accurately. A verification request may append a system audit event; it must never change a business record or status.

## Module boundaries and delivery scope

| Module | Capability |
| --- | --- |
| 0 | Core Platform and Architecture |
| 1 | Identity, Institutions and Access Control |
| 2 | Government ICT Project Registry |
| 3 | Technical Clearance |
| 4 | PPA and Ministry of Finance Clearance Verification |
| 5 | Project Implementation Oversight |
| 6 | UAT and Technical Conformity |
| 7 | Certification and Certificate of Conformity |
| 8 | Ministry of Finance Certificate Verification |
| 9 | Document and Records Management |
| 10 | Tasks, Notifications and Communications |
| 11 | Dashboards, Reporting and Analytics |
| 12 | Government Integration Layer |
| 13 | Audit, Security and Compliance |
| 14 | Testing, DevOps and Deployment |

Module numbers identify capabilities, not isolated applications or a rigid implementation order. Module 0 establishes the common extension contracts; Modules 1, 9, 10 and 13 later extend the shared identity, document, workflow/task and audit capabilities. Never build duplicate platform services because a capability has its own module number. Basic testing and secure practices apply from the first runtime change, even before the full Module 14 capability is delivered.

## Development rules

- Read [README.md](README.md), [architecture](docs/architecture.md), [workflow rules](docs/workflows.md), and the [Module 0 plan](docs/module-0-plan.md). Inspect existing code and nested instructions before editing.
- Keep business policy out of presentation components. Modules use documented platform interfaces; database writes follow defined ownership and authorization boundaries.
- The owner-selected Module 0 stack is Next.js, TypeScript, Tailwind CSS, shadcn/ui, NestJS, REST/Swagger, PostgreSQL, Prisma, Redis, MinIO/S3, Docker and Docker Compose, with OAuth2/OIDC-compatible, Keycloak-ready and MFA-ready authentication. Record implementation choices in `docs/decisions/`; do not change this stack silently.
- Keep schemas, migrations and API contracts consistent across modules. No opportunistic per-module Project ID generators, user stores, file stores, audit tables or approval engines.
- Store timestamps consistently in UTC; presentation may use the user's timezone. Never infer authority from a display name, email domain or client-supplied role.
- Keep credentials, private keys, real applicant/project records, uploaded case evidence and personal data out of Git. Use synthetic fixtures and documented configuration templates; secret values belong in approved runtime configuration.
- Apply least privilege, document access checks, secure configuration and data protection by design. Do not claim compliance or production readiness without evidence.
- Require appropriate checks for the change. Documentation-only changes need link, consistency and scope validation; do not claim runtime tests when there is no runtime. Future workflow/access changes require meaningful positive and negative tests, including role/institution boundaries and forbidden transitions.
- Keep changes focused and reviewable, follow the pull request checklist, and report what changed, validation performed and unresolved limitations. Do not use destructive Git history operations to publish routine work.
- Update documentation when authorized architecture or policy changes affect these rules. Preserve the rationale and traceability to the owner's requirements; conflicting or missing workflow policy must not be silently invented.

## Acceptance checklist for every applicable change

1. One integrated application, repository, project master and common platform services remain intact.
2. Both review hierarchies and the distinction between recommendation, final decision and issuance remain intact.
3. PPA can verify only Technical Clearance; MoF can verify both clearance and certificates; neither can mutate business records.
4. The change implements only the currently requested module/scope.
5. Relevant evidence, documentation, validation and audit requirements are preserved.
