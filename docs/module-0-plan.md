# Module 0: Core Platform and Architecture

Status: **Module 0 complete and verified**. The owner's 2 October 2026 request authorizes the selected stack and reusable workflow/state-machine engine, superseding the preparation-only status and narrower future-scope notes below. See the [implementation decisions](decisions/0002-module-0-stack.md), [workflow service decision](decisions/0003-workflow-foundation.md) and [validation record](module-0-validation.md). The original plan is retained for traceability; Modules 1–14 remain outside this increment.

## Goal

Establish the technical foundation of the one integrated NITA application so future capabilities share the same project identity, persistence, authentication/RBAC, documents, workflow, audit and API conventions.

## What this preparation delivers

- Permanent project rules in [AGENTS.md](../AGENTS.md).
- Project overview and Modules 0–14 roadmap in [README.md](../README.md).
- [Architecture baseline](architecture.md), [workflow/verification rules](workflows.md) and an [accepted integrated-application decision](decisions/0001-integrated-application.md).
- Repository text/Git conventions and a pull request checklist.
- A [source reference](reference/workflow-source.md) identifying the supplied workflow image and its checksum.

The original preparation was documentation-only. Module 0 now adds runtime components, the integrated schema/migrations, infrastructure and shared services; it introduces no Module 1–14 business capability.

## Future Module 0 scope

| Work package | Deliverable | Boundary |
| --- | --- | --- |
| Stack decisions | ADRs for runtime/framework, database/migrations, identity integration, document storage and environment approach | Select products for the integrated application; no separate stack per module |
| Application foundation | One composition root, shared configuration and documented local startup | Bootstrap only; no business-module screens or commands |
| Integrated data foundation | One persistence/migration convention; shared ID types and documented data ownership | Do not build the Module 2 project registry or generate a second project master |
| Identity/authorization contract | Trusted actor context, common authorization interface and default-deny convention | No Module 1 user/institution administration or full role-management UI |
| Documents contract | Shared document/version references, storage/access interface and evidence conventions | No Module 9 records-management business features |
| Workflow contract | Shared transition, guard, assignment, condition and history interfaces | No executable Module 3 or Module 6 business workflow |
| Audit contract | Common event envelope, actor/correlation context and persistence consistency convention | No Module 13 audit dashboard or complete compliance subsystem |
| API foundation | Versioning, validation, error, authorization and correlation conventions | No functional PPA/MoF verification endpoints |
| Foundation validation | Stack-appropriate checks and meaningful bootstrap/contract tests | No claim that an end-to-end lifecycle has been implemented or tested |

Technical probes or synthetic fixtures used to validate the foundation must not expose unfinished business features. Shared contracts may be extended later through reviewed changes, while keeping the permanent architecture rules.

## Proposed sequence for the next development task

1. Read the repository instructions and confirm the Module 0 task scope.
2. Resolve the stack choices needed for the foundation and record their rationale as ADRs.
3. Create the single application bootstrap and shared source/test structure.
4. Establish configuration, persistence, shared IDs and platform interfaces.
5. Establish server-side authorization, API and audit conventions at the foundation boundary.
6. Validate the foundation and document truthful setup commands and limitations.

Do not use this plan as authorization to implement Modules 1–14. Those capabilities are introduced through subsequent development tasks in the same repository.

## Future Module 0 acceptance criteria

Foundation and environment acceptance are tracked below; the [validation record](module-0-validation.md) links the successful full-platform verification run.

- [x] Runtime and supporting product choices are recorded and reproducible through the lockfile.
- [x] One backend bootstrap and coordinated frontend/backend release structure exist.
- [x] One integrated schema and committed migration sequence are provided and verified against PostgreSQL.
- [x] Shared Project ID anchors and foreign keys prevent independent project masters.
- [x] Common actor/RBAC, document, workflow, audit and API interfaces are defined.
- [x] Local tests cover configuration, authorization defaults and foundation contracts.
- [x] Setup instructions and synthetic configuration examples match the selected stack.
- [x] Exact clearance/conformity hierarchies and read-only verification limits remain preserved.
- [x] No Module 1–14 business capability has been implemented outside the task scope.
- [x] Complete Docker startup, 11 real-dependency integration tests, API/frontend smoke checks and dependency outage/recovery passed.

## Future behavior checks for the business modules

Use these requirements when the affected capability is implemented; they are not tests claimed to have run in this baseline.

| Scenario | Required result |
| --- | --- |
| A project passes through clearance, implementation, UAT and certification | Every stage references the original Project ID |
| A committee or Director attempts a final decision | Server rejects the action without the Director-General authority |
| A later review is attempted before the required earlier recommendation | Shared workflow engine rejects the transition |
| A materially revised report is submitted after recommendation | Revised version enters the affected review cycle; prior history remains |
| Conformity is decided but no certificate is issued | Show the final decision and certificate status separately |
| Certificate issuance occurs without an eligible final decision | Reject issuance and retain an audit record |
| A retry repeats certificate issuance | Do not issue a duplicate certificate |
| PPA verifies a clearance | Return only the permitted read-only clearance view |
| PPA requests certificate details through API, search or export | Deny or exclude the unauthorized data consistently |
| MoF verifies clearance or a certificate | Return the appropriate restricted read-only view |
| PPA/MoF submits a business mutation or transition | Reject it; leave business records unchanged |
| A user attempts access outside authorized institution/project scope | Deny access on the server |

## Decisions that require policy detail

Capture unresolved conditions, delegation, committee mechanics, returns/appeals, certificate status policy, verification fields and go-live applicability in relevant design tasks. A missing policy must not become an invented permission or an alternative approval path.
