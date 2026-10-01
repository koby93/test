# ADR 0001: One integrated application with common platform services

Date: 2026-10-01  
Status: Accepted for the repository baseline  
Source: Project owner's global requirements and supplied lifecycle workflow

## Context

NITA's Technical Clearance and Conformity Management System will contain Modules 0–14. The owner requires one integrated application and repository, one authoritative Project ID, one integrated database architecture, and common authentication/RBAC, document management, workflow, audit and API capabilities.

Technical Clearance precedes implementation. UAT and Technical Conformity precede certificate issuance. Both review hierarchies culminate in a Director-General decision; the Certification Unit issues the Certificate of Conformity through the Certification System. PPA verifies clearance only; MoF verifies clearance and certificates. Both have read-only access.

## Decision

Adopt a **modular monolith** as the initial architecture, with one application composition root and coordinated release. Keep the numbered capabilities as internal modules in this repository and compose them through common platform interfaces.

Use one project master, immutable Project ID and integrated persistence model. A shared document store may hold file bytes while authoritative metadata and relationships remain in the integrated data architecture.

Place the Certification System within Module 7 of this product. Provide PPA/MoF verification through restricted views and contracts of the same application, without separate applications or independent decision databases.

Centralize transition guards, access control and audit behavior. Preserve the exact lifecycle, approval hierarchy and separation between recommendation, final decision and issuance documented in [AGENTS.md](../../AGENTS.md) and [workflows](../workflows.md).

Keep runtime language/framework, database product, identity provider, storage product and deployment environment open for decisions in the relevant development task. This ADR selects the architecture boundary, not an unrequested technology stack.

## Alternatives considered

| Alternative | Assessment |
| --- | --- |
| Separate applications/repositories or databases per module | Conflicts with the owner's explicit integration requirements and risks duplicated project identities and governance |
| Distributed services for each numbered capability | Adds operational and transaction complexity before a demonstrated need; not the initial design |
| One application without internal boundaries | Meets the product count but makes shared behavior and ownership harder to maintain; use explicit module/platform boundaries instead |

## Consequences

- Future modules reuse shared services and keep references to the same authoritative project.
- Workflow transitions and their audit records can follow a common transaction model.
- Capability dependencies determine implementation order; module numbering does not create separate deliverables or permission to implement them now.
- Technology and deployment choices must support the integrated application rather than fragment it.
- A future architecture change requires documented rationale and an explicit owner instruction that permits any change to the non-negotiable global requirements.

The present task prepares the repository for Module 0. Modules 1–14 remain unimplemented.
