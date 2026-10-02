# NITA Technical Clearance and Conformity Management System

One integrated application for managing government ICT projects from the request for Technical Clearance to the issuance of a Certificate of Conformity, with NITA oversight and controlled inter-agency verification.

**Current status: Module 0 complete and verified.** The repository contains the frontend, backend, common contracts, schema/migrations, infrastructure and reusable workflow engine. Builds, type checks, 43 tests, complete Docker startup, full-stack smoke checks and dependency outage/recovery passed in the [verification run](https://github.com/koby93/test/actions/runs/36997601590). See the [validation record](docs/module-0-validation.md) for the evidence and remaining integration boundaries. Modules 1–14 remain planned only.

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

The Certification System belongs to this application as Module 7. PPA and MoF access are restricted capabilities in the same application. The owner-selected stack is Next.js/TypeScript/Tailwind/shadcn/ui, NestJS REST/Swagger, PostgreSQL/Prisma, Redis, MinIO/S3 and Docker Compose. Frontend and backend are components of this one product, with one backend composition root, integrated schema and coordinated release. See [ADR 0002](docs/decisions/0002-module-0-stack.md).

Read [AGENTS.md](AGENTS.md) before development. It contains the permanent project rules. The [architecture description](docs/architecture.md) and [architecture decision](docs/decisions/0001-integrated-application.md) explain the boundaries and rationale.

## Development roadmap

The numbering describes capability areas. Delivery follows dependencies and the scope of each development task; it does not create separate applications.

| Module | Capability | Planned responsibility | Status |
| --- | --- | --- | --- |
| 0 | Core Platform and Architecture | Application foundation, platform interfaces, shared conventions and architecture baseline | Complete and verified |
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
| `frontend/` | Next.js frontend component, Tailwind/shadcn UI and frontend tests |
| `backend/src/platform/` | NestJS composition, configuration, auth, persistence, cache, storage, audit, health and workflow services |
| `backend/prisma/` | One schema and ordered PostgreSQL migrations, including append-only history guards |
| `backend/test/` | Unit/HTTP/OIDC tests and real-dependency integration tests |
| `packages/contracts/` | Shared Project ID, roles, workflow kinds, health and error contracts |
| `infra/`, `compose.yaml` | Container builds, bucket initialization and the coordinated development environment |
| `.github/workflows/module-0.yml` | Module 0 builds/tests and Docker startup, integration, outage and recovery checks |

This is an npm workspace monorepo. The workspace packages are product components and shared contracts, not standalone business-module applications. All dependencies are locked in the root `package-lock.json`.

## Start the complete development environment

Install Docker Engine/Desktop with Docker Compose v2, then run from the repository root:

```sh
docker compose up
```

Compose builds both components, starts PostgreSQL/Redis/MinIO, creates the private records bucket, applies both Prisma migrations, and starts the API and frontend after their dependencies are ready. The first build also compiles the pinned MinIO security release from source; allow extra time for its Go dependencies to download. No manual database setup or seed is required. The baseline contains no real project or user data.

| URL | Purpose |
| --- | --- |
| `http://localhost:3000` | Frontend with live dependency status |
| `http://localhost:4000/api/v1/platform` | Platform information |
| `http://localhost:4000/api/v1/health/live` | Process liveness |
| `http://localhost:4000/api/v1/health/ready` | PostgreSQL, Redis and bucket readiness; HTTP 503 on dependency failure |
| `http://localhost:4000/api/v1/docs` | Development Swagger UI |
| `http://localhost:4000/api/v1/openapi.json` | OpenAPI document |
| `http://localhost:9001` | Development MinIO console |

Published development ports bind to `127.0.0.1`. Named volumes retain database, cache and object-store data when containers stop. `docker compose down` stops the environment without removing those volumes.

`.env.example` documents the synthetic development defaults and host-side configuration. Compose works without copying it. To customize settings, copy it to `.env`; do not commit secret values. The default MinIO login is `nita-development` / `development-only-storage` and the default PostgreSQL database/user is `nita` with password `development-only-database`. These values are for disposable/local development only. Host ports can be overridden with `FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`, `REDIS_PORT`, `MINIO_PORT`, and `MINIO_CONSOLE_PORT`; update public URLs/CORS when changing browser-facing ports.

## Build and test

For host-side builds/tests, install Node 24 and npm 11:

```sh
npm ci
npm run build
npm run typecheck
npm test
```

For host-side Prisma validation/migrations, set `DATABASE_URL` from `.env.example` or use the Compose migration service. `npm run db:generate` regenerates the Prisma client; `npm run db:validate` validates the schema; `npm run db:migrate` applies the committed migrations. Never replace migration history with `db push`.

With the complete Compose environment running:

```sh
docker compose --profile test run --rm platform-tests
node scripts/smoke.mjs
```

The integration suite uses synthetic fixtures in the configured database and tests persistence, workflow ordering, project scope, missing evidence, failed conditions/validation, stale revisions, idempotency, concurrency, transaction rollback and database history guards. Run it against a development/test database, never an operational database. GitHub Actions performs these checks in disposable volumes and also verifies dependency outage/recovery.

For live source development, first start the infrastructure and initialization services, copy `.env.example` to `.env`, and run the host processes in separate terminals:

```sh
docker compose up -d postgres redis minio minio-init migrate
npm run build -w @nita/contracts
npm run dev:backend
```

```sh
npm run dev:frontend
```

## Authentication and future workflow modules

The global authentication guard denies protected routes unless a valid signed bearer token is verified. Public foundation routes are explicitly marked public. `OIDC_ENABLED=false` enables only the public development foundation; it does not create a bypass for protected routes. Production configuration requires OIDC. Swagger is served only outside production.

Set `OIDC_ENABLED=true`, `OIDC_ISSUER_URL`, `OIDC_JWKS_URI` and `OIDC_AUDIENCE` to connect an OAuth2/OIDC JWT issuer. Keycloak-compatible claims are `sub`, `realm_access.roles`, `institution_id` and optional `project_ids`. The token must have a valid signature, issuer, audience, issue time and expiry. Module 1 will establish authoritative role/membership administration; do not treat arbitrary request fields as grants.

`OIDC_REQUIRE_MFA=true` requires a trusted `amr` claim containing `mfa`; optional `OIDC_MFA_ACR` also requires the configured assurance level. The identity provider must enforce and map that assurance. Login screens, Keycloak realm administration and MFA enrollment belong to later work and are not implemented here.

The shared workflow service supports the four lifecycle kinds, validates server-owned conditions/documents, enforces the approved review sequence, and commits state, transition/evidence and audit together. It records all requested transition metadata. Workflow definitions and resolvers are registered by internal code and pinned by version; no business workflows are registered at startup and no mutation endpoints are exposed. See [ADR 0003](docs/decisions/0003-workflow-foundation.md). Modules 1–14 extend the same application and services.
