# Lifecycle, workflow and verification rules

This baseline translates the project owner's requirements and supplied workflow into development constraints. The explicit written requirements govern if a visual label is abbreviated or ambiguous. No routes, executable workflow definitions or business screens are implemented here.

## Official lifecycle

**Technical Clearance → Project Implementation → UAT and Technical Conformity → Certificate of Conformity.**

All stages retain the same authoritative Project ID. Review and issuance records have their own identifiers while remaining linked to that project.

| Phase | Inputs and activities | Recorded outcome / progression gate |
| --- | --- | --- |
| Technical Clearance | Institution request and documents; Technical Working Group assessment; technical assessment report; ordered review/recommendation | Director-General clearance decision, conditions, register update and communication to institution |
| Project Implementation | Detailed implementation plan; NITA plan review and guidance; milestone oversight; regular institution status updates | Implementation evidence and condition status supporting readiness for UAT/conformity assessment |
| UAT and Technical Conformity | UAT plan and scripts; NITA plan review; joint institution/NITA testing; assessment report; ordered review/recommendation | Director-General final conformity decision and explicit outstanding conditions/further actions |
| Certificate of Conformity | Certification Unit validates the decision and issuance eligibility; prepares details; issues through the integrated Certification System | Certificate, certification register update and institution notification; final sign-off/go-live where applicable |

The workflow diagram lists functional, integration, performance, security, backup/restore, disaster-recovery and compliance testing. Coverage should follow the approved UAT scope and project requirements; recording a result is distinct from making the final conformity decision.

## Technical Clearance authority

| Order | Actor | Action | Authority boundary |
| --- | --- | --- | --- |
| 1 | Technical Working Group | Assess architecture, security, data, hosting, integration and alignment with GGEA/eGIF and applicable standards; produce report/recommendation | Assessment, not final clearance |
| 2 | Technical Clearance Committee | First review/recommendation based on the assessment report | Recommendation, not final clearance |
| 3 | Director, Technical Services | Second review/recommendation; validate the committee recommendation and recommend to the Director-General | Recommendation, not final clearance |
| 4 | Director-General | Approve, approve with conditions, or deny | Final Technical Clearance decision |

Update the Technical Clearance register and communicate the recorded decision. PPA/MoF verification reads that decision; verification does not approve a project or substitute for any review stage.

## Conformity and certification authority

| Order | Actor | Action | Authority boundary |
| --- | --- | --- | --- |
| 1 | Technical Assessment/UAT Team | Prepare conformity assessment report using test results, findings, compliance and outstanding issues | Assessment, not final conformity |
| 2 | Technical Clearance Committee | First review/recommendation based on the conformity report | Recommendation, not final conformity |
| 3 | Director, Technical Services | Second review/recommendation; validate and recommend to the Director-General | Recommendation, not final conformity |
| 4 | Director-General | Approve conformity, approve with conditions, or require further action | Final conformity decision |
| 5 | Certification Unit | Validate final decision and eligibility; register the project in the Certification System using its existing Project ID; issue and record the certificate | Certificate issuance following the final decision |

The Certification Unit may prepare and issue the certificate; it may not replace the Director-General's conformity decision with its own approval. The Director-General decision alone does not mean a certificate has already been issued. The certification register records the issued certificate, project link, scope, conditions, validity and status.

## Shared workflow safeguards

- Required recommendations occur in order. Later authorities act only when the applicable prior stage is complete.
- The authenticated actor needs the assigned authority as well as institution/project access. Apply the same checks to UI, API, integration and administrative actions.
- Link each recommendation or decision to the report/submission/evidence versions reviewed. Material revisions invalidate reliance on earlier endorsements for the revised version and require the affected review cycle to be repeated.
- Preserve assessment findings, reasons, conditions, revisions and prior decisions. Returning for correction must not erase the previous record.
- Store conditional approval explicitly. Blocking versus non-blocking conditions must be defined before implementing progression; do not infer that every conditional decision permits the next phase or immediate certificate issuance.
- Make final decisions and certificate issuance separate commands and audit events. Use transaction and concurrency controls to prevent duplicate or out-of-order actions.
- Retain pending, denied, further-action and unavailable outcomes accurately. Missing evidence or a recommendation must never appear as an approved final decision.
- A certificate is a prerequisite for operational go-live where applicable in the supplied workflow. Applicability and any exceptional policy need explicit definition before enforcement; developers must not invent an exception.

## External verification permissions

| Capability | PPA | MoF |
| --- | --- | --- |
| Verify Technical Clearance status | Allowed, read-only | Allowed, read-only |
| Verify Certificate of Conformity status | Not allowed | Allowed, read-only |
| View internal assessment/UAT evidence | Not granted by verification access | Not granted by verification access |
| Amend project data or documents | Not allowed | Not allowed |
| Recommend/approve/deny or change conditions | Not allowed | Not allowed |
| Advance lifecycle/workflow | Not allowed | Not allowed |
| Issue, replace or revoke a certificate | Not allowed | Not allowed |

Authorized verification responses should identify the relevant project and authoritative decision/certificate status without exposing unrestricted project details. Exact response fields, discovery rules and document visibility remain to be defined for Modules 4 and 8. Verification requests are audited by the system; they do not change business records. Access restrictions apply to search, exports, downloads and direct API calls, including any generic project endpoint.

## Requirement traceability

| Owner requirement | Permanent rule / design location |
| --- | --- |
| One integrated application and repository | [AGENTS.md](../AGENTS.md), architecture rules 1–2; [ADR 0001](decisions/0001-integrated-application.md) |
| One Project ID and integrated database | AGENTS.md, architecture rules 3–4; [data ownership](architecture.md) |
| Common authentication/RBAC, documents, workflow, audit and API | AGENTS.md, architecture rules 5–9; architecture shared-platform contracts |
| Official four-phase lifecycle | AGENTS.md lifecycle; this document's phase table |
| Technical Clearance hierarchy | AGENTS.md clearance hierarchy; this document's authority table |
| Technical Conformity hierarchy and Certification Unit issuance | AGENTS.md conformity hierarchy and architecture rule 10; this document's authority table |
| PPA clearance only; MoF clearance and certificate; both read-only | AGENTS.md external verification; this document's permissions matrix |
| Do not implement Modules 1–14 yet | AGENTS.md current scope; [Module 0 plan](module-0-plan.md) |
| Prepare repository and roadmap before code | [README.md](../README.md); Module 0 plan; repository conventions |

## Policy details to resolve before affected implementation

Role assignments and delegation, quorum and committee review mechanics, returns for revision/appeals, blocking conditions, exact verification fields, certificate signing/validity/revocation and go-live applicability are not fully specified by the current inputs. Keep them as explicit design questions. They do not change the hierarchy, institutional verification limits or shared architecture.

## Supplied workflow reference

Source: the project owner's attachment, **Technical Clearance Workflow(1).png**, reviewed for this baseline on **1 October 2026**. Its filename and checksum are recorded in the [source reference](reference/workflow-source.md); the source image remains an externally supplied attachment. Its cross-cutting activities include stakeholder communication, security/risk management, data governance/privacy, government shared platforms, records and monitoring/compliance. The reviewed lifecycle and authority rules are transcribed in this document.
