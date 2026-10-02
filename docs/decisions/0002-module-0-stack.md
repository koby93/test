# ADR 0002: Owner-selected Module 0 stack and workspace layout

Date: 2026-10-02  
Status: Accepted  
Source: Explicit Module 0 implementation request

The owner selected Next.js, TypeScript, Tailwind CSS, shadcn/ui, NestJS, REST/Swagger, PostgreSQL, Prisma, Redis, MinIO/S3, Docker and Docker Compose. Adopt that stack within the single integrated application established by ADR 0001.

Use npm workspaces with `frontend/`, `backend/` and `packages/contracts/`, one root dependency lockfile, one integrated Prisma schema/migration history and a coordinated Docker build/release. Frontend/backend containers are components of the same product; no business module receives a separate application or database. The backend has one NestJS composition root and common platform services.

Use Node 24, TypeScript 5.9, Next 16, Nest 11, Tailwind 4, React 19 and Prisma 6.19.3. Prisma 6 retains the established generated-client/migration interface; newer major-version adapter/configuration changes are not needed for this foundation. Exact resolved versions and integrity hashes are locked in `package-lock.json`. MinIO is compiled from the upstream security release `RELEASE.2025-10-15T17-29-55Z`, verified against commit `9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a`, using a pinned Go toolchain. This avoids relying on unavailable upstream Docker Hub binary images. The runtime explicitly includes curl for health checks, and the existing Node/S3 SDK initializes the private bucket; PostgreSQL 17 and Redis 7 use maintained major-version image tags. shadcn components are source-owned in `frontend/src/components/ui` with `components.json` and the Radix/Tailwind dependencies.

Authentication uses signed OAuth2/OIDC JWT bearer verification through configured issuer/JWKS/audience, with Keycloak-style roles/scope claims and optional MFA assurance requirements. No users, role-administration screens, login flow or realm provisioning are introduced in Module 0.

Provide synthetic local development defaults so `docker compose up` works from the repository root. Published development services bind to loopback; object storage starts with a private records bucket. Infrastructure and runtime readiness are checked separately from process liveness. This development environment is not a production deployment or a compliance certification.

Basic tests and a foundation-only GitHub Actions check accompany this increment as required by the owner. Full DevOps/deployment management and business Modules 1–14 remain later capabilities.

Primary implementation references:

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [NestJS versioning](https://docs.nestjs.com/techniques/versioning)
- [NestJS exception filters](https://docs.nestjs.com/exception-filters)
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [shadcn/ui manual installation](https://ui.shadcn.com/docs/installation/manual)
- [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
