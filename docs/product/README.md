# Arcwell product documents

These ten documents are the source of truth for building Arcwell. They exist so that people and AI agents build the same, finished app. Read the one that matches your change before writing code (AGENTS.md §1).

| # | Document | Answers |
|---|---|---|
| 01 | [PRD](01-PRD.md) | What we're building, for whom, why; v1 scope and what's out; key rules; success metrics |
| 02 | [Technical requirements](02-TECH-REQUIREMENTS.md) | The fixed stack and versions, repo layout, data flow, environments, non-functional requirements |
| 03 | [App flow](03-APP-FLOW.md) | Every route and how users move between screens, by role |
| 04 | [UI/UX design brief](04-DESIGN-BRIEF.md) | Colours, type, spacing, components, motion, accessibility, the anti-slop checklist |
| 05 | [Backend schema](05-BACKEND-SCHEMA.md) | Every table and column, who reads and writes, payload shapes, access functions |
| 06 | [API integrations](06-API-INTEGRATIONS.md) | Each outside service and Edge Function: requests, responses, errors, secrets |
| 07 | [Security and access](07-SECURITY-ACCESS.md) | Roles, the permission matrix, enforcement, consent, failure protocols, breach response |
| 08 | [AI guardrails and rules](../../AGENTS.md) | The rule file every AI agent reads: patterns, forbidden shortcuts, required checks, done |
| 09 | [Feature tickets](09-FEATURE-TICKETS.md) | The PRD as tickets with acceptance criteria and status |
| 10 | [Deployment and testing runbook](10-DEPLOYMENT-RUNBOOK.md) | Local testing steps, the staging protocol, the production launch checklist, rollback |

**Keeping them true:** a change that alters scope, a screen, the schema, an API or access updates the matching document in the same pull request (AGENTS.md §7). Decisions are recorded in [DECISIONS.md](../DECISIONS.md).
