# NITA Technical Clearance and Conformity Management System

One integrated application for managing government ICT projects from the request for Technical Clearance to the issuance of a Certificate of Conformity, with NITA oversight and controlled inter-agency verification.

**Current status: repository prepared for Module 0.** This baseline defines the architecture, permanent development rules, lifecycle and roadmap. It contains no runtime application, database migrations, authentication screens or implemented business modules. Modules 1–14 are planned only.

## Official lifecycle and decision authority

**Technical Clearance → Project Implementation → UAT and Technical Conformity → Certificate of Conformity.**

| Process | Mandatory order |
| --- | --- |
| Technical Clearance | Technical Working Group → Technical Clearance Committee **first review/recommendation** → Director, Technical Services **second review/recommendation** → Director-General **final decision** |
| Technical Conformity and certification | Technical Assessment/UAT Team → Technical Clearance Committee **first review/recommendation** → Director, Technical Services **second review/recommendation** → Director-General **final conformity decision** → Certification Unit **issues the Certificate of Conformity through the Certification System** |

Recommendations, final decisions and certificate issuance are separate, auditable actions. Implementation and testing must retain evidence and address the conditions recorded by NITA. See the [detailed workflow rules](docs/workflows.md) and [supplied workflow reference](docs/reference/workflow-source.md).

| External institution | May verify | Access |
| --- | --- | --- |
| Public Procurement Authority (PPA) | Technical Clearance only | Read-only |
| Ministry of Finance (MoF) | Technical Clearance and Certificate of Conformity | Read-only |

Neither institution may change NITA decisions, advance workflows or issue certificates.

## Integrated architecture

The initial design is a **modular monolith**: one product, repository, application composition root and coordinated release, with internal modules using common platform services.

All modules share:

- **One authoritative Project ID**, retained through every lifecycle phase.
- **One integrated database architecture** and coordinated migration history.
- **Common authentication and RBAC**, with institution and project access boundaries.
- **Common document management**, including versions and evidence links.
- **Common workflow engine**, enforcing the approval hierarchies.
- **Common audit trail**, preserving decisions and access history.
- **Common API architecture**, including restricted verification contracts.

The Certification System belongs to this application as Module 7. PPA and MoF access are restricted capabilities in the same application. Technical product choices are open for Module 0; no framework, database product, identity provider or hosting vendor has been selected in this baseline.

Read [AGENTS.md](AGENTS.md) before development. It contains the permanent project rules. The [architecture description](docs/architecture.md) and [architecture decision](docs/decisions/0001-integrated-application.md) explain the boundaries and rationale.

## Development roadmap

The numbering describes capability areas. Delivery follows dependencies and the scope of each development task; it does not create separate applications.

| Module | Capability | Planned responsibility | Status |
| --- | --- | --- | --- |
| 0 | Core Platform and Architecture | Application foundation, platform interfaces, shared conventions and architecture baseline | Prepared for development |
| 1 | Identity, Institutions and Access Control | Institutions, users, role assignments and access administration using common identity/RBAC | Planned |
| 2 | Government ICT Project Registry | Authoritative project master, Project ID and lifecycle-linked registry | Planned |
| 3 | Technical Clearance | Submissions, assessment, ordered recommendations and Director-General decisions | Planned |
| 4 | PPA and Ministry of Finance Clearance Verification | Read-only clearance verification through restricted views/contracts | Planned |
| 5 | Project Implementation Oversight | Implementation plans, conditions, guidance, milestones and oversight | Planned |
| 6 | UAT and Technical Conformity | UAT planning, evidence, assessment and ordered conformity decisions | Planned |
| 7 | Certification and Certificate of Conformity | Certification Unit issuance, certificate records and integrated certification register | Planned |
| 8 | Ministry of Finance Certificate Verification | Read-only certificate verification for MoF | Planned |
| 9 | Document and Records Management | Shared documents, versioning, classification, retention and evidence management | Planned |
| 10 | Tasks, Notifications and Communications | Shared assignments, reminders and lifecycle communications | Planned |
| 11 | Dashboards, Reporting and Analytics | Authorized operational reporting and management visibility | Planned |
| 12 | Government Integration Layer | Government-system adapters using the common API and project references | Planned |
| 13 | Audit, Security and Compliance | Shared audit assurance, security controls and compliance evidence | Planned |
| 14 | Testing, DevOps and Deployment | Comprehensive validation, delivery pipelines, environments and operations | Planned |

Planned delivery groups:

1. **Foundation:** Module 0; then identity, project registry and the required shared records, tasks and audit capabilities.
2. **Pre-implementation:** Technical Clearance and restricted PPA/MoF clearance verification.
3. **Implementation and assessment:** Oversight, UAT and Technical Conformity.
4. **Certification:** Certificate issuance and restricted MoF certificate verification.
5. **Ecosystem and operations:** Reporting, integrations and the remaining security, records and operational capabilities.

Testing, security and documentation accompany every implemented increment. They are not deferred until the later module numbers. No delivery dates or completion claims are implied by this roadmap.

## Repository structure

| Current path | Purpose |
| --- | --- |
| `AGENTS.md` | Permanent architecture, development rules and critical workflow constraints |
| `README.md` | Project overview, roadmap and repository guide |
| `docs/architecture.md` | Shared services, conceptual data ownership and future source layout |
| `docs/workflows.md` | Lifecycle gates, approval hierarchies, verification permissions and source traceability |
| `docs/module-0-plan.md` | Scope, deliverables, open decisions and acceptance criteria for Module 0 |
| `docs/decisions/0001-integrated-application.md` | Accepted decision to use one integrated application with common services |
| `docs/reference/workflow-source.md` | Source filename, checksum and traceability for the reviewed workflow image |
| `.github/PULL_REQUEST_TEMPLATE.md` | Review checklist for scope, architecture, workflow and access rules |
| `.editorconfig` | Consistent text-file conventions |
| `.gitattributes` | Text line endings and binary-image handling |
| `.gitignore` | Generated files, local configuration, credentials and operational records exclusions |

When runtime development begins, Module 0 will establish `src/`, `tests/` and `infra/` as described in [architecture](docs/architecture.md). Those directories and module implementations are not created by this documentation baseline.

## Starting Module 0

1. Review `AGENTS.md`, the architecture decision and the workflow rules.
2. Use the [Module 0 plan](docs/module-0-plan.md) to select and document the stack and establish the single application foundation.
3. Establish shared interfaces and conventions without delivering Modules 1–14 unless the development task explicitly includes them.
4. Validate foundation behavior and preserve the permanent workflow and verification constraints.

There is no application to install or run at this stage. Runtime setup commands and environment templates will be added with the selected stack during Module 0 development.
