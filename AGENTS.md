# Arcwell — AI guardrails and rule file (document 08)

Every AI coding agent (and every person) working in this repo follows this file. It exists to stop broken code and unfinished apps. If a rule here blocks what you were asked to do, **stop and ask**; don't route around it.

## 1. Read before you change anything

| Changing | Read first |
|---|---|
| Scope or behaviour | [docs/product/01-PRD.md](docs/product/01-PRD.md) (what and why), then [DECISIONS.md](docs/DECISIONS.md) for the D-number |
| Libraries, structure, environments | [02-TECH-REQUIREMENTS.md](docs/product/02-TECH-REQUIREMENTS.md) |
| Screens or navigation | [03-APP-FLOW.md](docs/product/03-APP-FLOW.md) and [04-DESIGN-BRIEF.md](docs/product/04-DESIGN-BRIEF.md) |
| Tables, policies, SQL functions | [05-BACKEND-SCHEMA.md](docs/product/05-BACKEND-SCHEMA.md) and [07-SECURITY-ACCESS.md](docs/product/07-SECURITY-ACCESS.md) |
| Edge Functions or outside services | [06-API-INTEGRATIONS.md](docs/product/06-API-INTEGRATIONS.md) |
| Picking up work | [09-FEATURE-TICKETS.md](docs/product/09-FEATURE-TICKETS.md): work on one ticket at a time and meet its acceptance criteria |
| Testing, deploying, releasing | [10-DEPLOYMENT-RUNBOOK.md](docs/product/10-DEPLOYMENT-RUNBOOK.md): local checks, staging order, launch checklist, rollback |
| Anything under `app/` | [app/AGENTS.md](app/AGENTS.md): Expo changes every SDK; check the versioned docs and use `npx expo install` |

`docs/SPEC.md`, `PLAN.md` and `DESIGN.md` are history and detail; where they differ from `docs/product/`, the product docs win.

## 2. Non-negotiables

- **Row-level security on every table.** Every new table ships in the same change with:
  - RLS enabled;
  - policies;
  - least-privilege grants;
  - an index on every foreign key;
  - pgTAP tests in `supabase/tests/` proving that a coach can't see another coach's clients, that a coach sees client data only from the join date unless history access is granted, and that access ends when the link ends.
- **Coached athletes never see AI.** Entitlements are enforced on the server (`ai_entitled()`), not just hidden in the UI.
- **AI only on the server**, through `supabase/functions/_shared/ai/`:
  - check entitlement, then the daily cap (`ai_try_use`), before any model call;
  - send only week-level numbers (`cleanContext`);
  - validate the model's structured output against the programming rules, and fall back to the rules engine;
  - decline out-of-scope questions (medical, injury, drugs, supplements) before the model.
- **Never put health data in logs or error messages.** Log an error name or code only.
- **No secrets in the app or the repo.** Only `EXPO_PUBLIC_*` public config in the app. Files go to Supabase Storage (private bucket, RLS on objects) through short-lived signed URLs (D72). Payloads store `sb:` paths, never URLs.
- **Schema changes are migrations** in `supabase/migrations/` (`npx supabase migration new <name>`). Never edit an applied migration; fix forward.
- **Science only (D69):**
  - every training, nutrition or recovery rule cites PubMed-checked evidence on the Sources page;
  - no bro science, no junk volume;
  - no supplement or nootropic suggestions, and never name the protocols book or its author (D75).

## 3. The fixed stack: no swaps

Use what's in doc 02. **Never add**:
- another state library (Redux, Zustand, React Query);
- a styling system (Tailwind, NativeWind, styled-components, UI kits);
- an ORM or GraphQL;
- a Node or Express server;
- another icon set;
- another backend.

A new dependency needs a reason in the PR. A new outside service needs a decision in DECISIONS.md and a row in doc 06.

## 4. Preferred patterns

| Do | Not |
|---|---|
| Read and write app data through `CoachDataProvider` (the one store) and the sync layer | Fetching Supabase directly from screens |
| Server calls through `features/accounts/repo.ts` or a feature's client file, returning `{data, error}` with a plain sentence | Throwing raw errors or showing Postgres messages |
| Design tokens (`theme/`) and primitives (`components/`) | Raw hex, magic spacing, a new button style |
| Shared screen states (`LoadingScreen`, `ScreenError`, `OfflineBanner`, `NotFound`), and an empty state with one action | Blank screens, spinners where a skeleton fits |
| `lib/alert` for confirms | `Alert.alert` directly (breaks on web) |
| Local-day helpers for dates (IST) | `toISOString().slice(0, 10)` |
| Pure, unit-tested logic in `features/<area>/*.ts` and `_shared/*.ts` | Business rules inside JSX |
| Pass `now` into render code | `Date.now()` / `new Date()` in render (React Compiler purity) |
| SQL functions: `security definer` only when needed, `set search_path = ''`, schema-qualified names, `revoke execute … from public, anon` | `security definer` with a default search path |
| Edge Functions: read the caller from the JWT, look up as the caller, use the service role only after checks | Trusting a user id in the body |
| Webhooks: verify the secret or signature first, idempotent, return 200 for ignored events | Parsing before verifying |

## 5. Forbidden shortcuts

- Disabling RLS, granting `all` to `anon` or `authenticated`, or adding a `using (true)` policy to "make it work".
- Skipping, deleting or weakening a failing test, or marking it `.skip`/`todo` to get green.
- `// @ts-ignore`, `any` casts or `eslint-disable` to hide a real error (explain any unavoidable one in a comment).
- Stub screens, fake data in signed-in mode, or "TODO: implement" in shipped code paths. If a ticket can't be finished, leave it **open** in doc 09 and say what's missing.
- Hard-coding a user id, invite code, key or URL.
- Editing generated files by hand (`app/public/legal/*`: run `npm --prefix app run legal:build`; `ios/`, `android/`).
- Editing an applied migration, or `db reset` against anything other than the local database.
- `npm install` for Expo packages (use `npx expo install`).
- Changing scope without updating the PRD and recording a decision.

## 6. Required checks before declaring work done

```bash
npm run lint && npm run typecheck && npm run test && npm run db:test
```

- `lint` = ESLint, `tokens:check` (design tokens) and `legal:check` (static legal pages are current).
- `test` = the Jest suite.
- `db:test` = every pgTAP test (needs `npm run db:start`).
- Edge Function changes: `deno check --node-modules-dir=auto supabase/functions/<name>/index.ts`, plus a curl check of each success and error path (recorded in the PR).
- UI changes: run the app (web preview is fine), go through the flow in doc 03, and check the loading, empty, error, offline and not-found states.

CI runs the same checks on every pull request. Don't merge on red.

## 7. Definition of done (every ticket)

1. Meets the ticket's acceptance criteria in doc 09.
2. All checks in §6 pass; new logic has tests (pgTAP for access, Jest for pure logic).
3. Docs updated in the same change: the ticket's status in doc 09, plus doc 05 or 06 or 07 if the schema, an API or access changed, plus a D-number in DECISIONS.md for any product decision.
4. No secrets, no health data in logs, no console noise.
5. Commit messages say what and why. Commit and push only when asked.
