# Architecture baseline

Status: accepted application boundaries; conceptual design only. Runtime technology and physical schemas remain open for Module 0.

## Product boundary

The NITA Technical Clearance and Conformity Management System is one integrated application. Start with a modular monolith, one composition root and a coordinated release. Modules represent internal capabilities; they do not receive independent authentication, project masters, databases or public application backends.

Institution users, NITA reviewers, final decision-makers, the Certification Unit and external verifiers use the same product with appropriately restricted views and permissions. Separate screens or navigation sections do not imply separate applications. Common infrastructure can include a database, document storage and background workers, all governed as part of this product.

## Shared platform contracts

| Common capability | Contract responsibility | Extension boundary |
| --- | --- | --- |
| Project identity | Stable Project ID type and lifecycle-wide references | Module 2 owns the project master and ID allocation; modules reference it |
| Authentication/RBAC | Authenticated actor context and server-side authorization by role, institution, project and action | Module 1 adds identity/institution/access administration through the shared service |
| Database/persistence | One integrated data model, transaction conventions and coordinated migrations | Module-owned tables use enforced references; no independent databases |
| Documents/records | Document IDs, versions, project associations, access checks and storage abstraction | Module 9 adds records capabilities; other modules attach evidence through this service |
| Workflow | Ordered review stages, guarded commands, conditions, assignment and immutable transition history | Modules register lifecycle workflows without writing independent engines |
| Audit | Common append-only events and correlation context | Module 13 adds assurance and audit views; all modules emit through the common contract |
| API | Common validation, versioning, authentication, authorization and errors | Module routes belong to the same API; Module 12 supplies adapters |
| Tasks/communications | Shared assignment and delivery interfaces linked to authoritative records | Module 10 extends tasks and notifications; messages never replace a recorded decision |

Module 0 defines the composition, contracts and minimum technical foundation. Numbered capability modules extend these contracts instead of duplicating them. Defining an interface in Module 0 does not mean implementing the business capability of Module 1, 9, 10 or 13.

## Authoritative data and ownership

This is a conceptual relationship map, not a migration or a selected schema.

| Record family | Authoritative owner | Relationship and invariant |
| --- | --- | --- |
| Institution and membership | Identity/institutions capability | Establish institution scope for users, projects and permissions |
| Project master | Government ICT Project Registry | Allocates one immutable Project ID and records responsible institution |
| Technical Clearance case | Technical Clearance capability | References the existing Project ID; retains submission versions, report, recommendations, decision and conditions |
| Implementation/oversight record | Implementation Oversight capability | References the same Project ID and relevant clearance decision/version |
| UAT/conformity case | UAT and Technical Conformity capability | References the same Project ID, test/evidence versions, recommendations and final conformity decision |
| Certificate and certification register entry | Certification capability | References the same Project ID and eligible Director-General conformity decision; owns certificate number and status |
| Document/version | Common documents service | Project evidence references Project ID; shared records use explicit authorized context and classification |
| Workflow instance/transition | Common workflow service | References the subject record and Project ID where applicable; preserves ordered transition history |
| Audit event | Common audit service | Records subject, actor, action, result and Project ID where applicable; retains history |
| Task/communication record | Common task/communications service | Links to the authoritative project/case and assigned action |

Each project-scoped record must reference the project master. Non-project administrative records, such as an institution profile, use their own IDs and authorized scope; they must not invent an alternative project identity. A certificate number or a clearance application number identifies its own record and is not a new Project ID. Map external agency references to the authoritative Project ID.

Do not create one universal status field that loses the difference between lifecycle phase, review stage, decision outcome, conditional obligations and certificate state. Retain versions and history so the application can show which evidence supported each decision.

One integrated database architecture means a common relational model and migration sequence, with foreign keys or equivalent enforced referential integrity. The database product is unselected. Document bytes may be stored in common object storage; the storage service is also unselected. Metadata and access control remain authoritative in the integrated system.

## Workflow and transaction boundaries

The shared workflow engine owns transition guards. Domain commands request transitions; the server verifies the authenticated authority, previous stages, evidence versions and blocking conditions. The browser never supplies its own final authority or silently advances a case.

Persist a recommendation/decision, its transition and its audit event in one transaction. Use concurrency controls so a stale review cannot approve a revised submission. Make retry-sensitive actions idempotent, particularly final decisions and certificate issuance. Deliver notifications only after the authoritative transaction succeeds; a notification failure must not fabricate or erase a decision.

Returning a submission for revision preserves the prior review cycle and starts the appropriate affected cycle. The precise returns, appeals, delegation and certificate status-change policies must be resolved before those features are implemented. Do not add unapproved final-decision actors.

## Access and verification boundary

Common authentication identifies the actor. Authorization also checks institution and project scope, assigned workflow authority and requested action. Platform administrators do not gain Director-General or Certification Unit authority merely by being administrators.

PPA receives a restricted Technical Clearance verification view only. MoF receives restricted Technical Clearance and Certificate of Conformity verification views. These are read-only projections of authoritative NITA records, not copied decision registers or separate verification applications.

Restrict search results, exports, document downloads and integration responses as well as individual record endpoints. External verifiers cannot submit business commands. The system may append an audit record when verification occurs, while leaving every business record and status unchanged. Exact verification fields and authentication requirements remain to be defined before those modules are implemented.

## Future source structure

The following paths are reserved design conventions, not existing implementations or separate applications. Adapt language-specific filenames through a documented stack decision while retaining the boundaries.

| Future path | Responsibility |
| --- | --- |
| `src/application/` | One bootstrap/composition root and common application/API entry points |
| `src/platform/` | Shared identity/authorization, persistence, documents, workflow, audit and API contracts |
| `src/modules/` | Authorized internal capabilities, introduced incrementally; no standalone module applications |
| `src/interfaces/` | Shared UI and API presentation adapters, if appropriate for the selected stack |
| `tests/` | Foundation, domain, authorization, integration and lifecycle tests as development proceeds |
| `infra/` | Configuration/deployment definitions for the one product; introduced when in scope |
| `docs/` | Architecture, workflow, module plans, decisions and operational documentation |

## Decisions still required

- Runtime language/framework, package management and application composition conventions.
- Database product, migration tooling and document-storage product.
- Identity-provider integration and authentication assurance for the different actor groups.
- Detailed data classifications, retention and document access policy.
- Project ID generation and optional human-readable reference format.
- Workflow state vocabulary, condition rules, return paths and delegation policy.
- API contract conventions and external-verification response fields.
- Certificate identifier, format, signature, validity and status-change policy.
- Hosting environment, configuration/secrets approach, backup/recovery and delivery tooling.

Open choices are not licenses to bypass the permanent requirements. Record resolved choices as ADRs and align implementation with [AGENTS.md](../AGENTS.md), the [workflow rules](workflows.md) and the [Module 0 plan](module-0-plan.md).
