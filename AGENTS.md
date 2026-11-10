# Arcwell — instructions for AI coding agents

Read `docs/SPEC.md` before changing behaviour; it is the source of truth for scope. App-specific Expo guidance lives in `app/AGENTS.md` — follow it for anything under `app/` (Expo changes every SDK; check versioned docs, use `npx expo install`).

## Non-negotiables

- **Row-level security on every table.** Every new table ships with RLS enabled, policies, and pgTAP tests in `supabase/tests/` proving: a coach cannot see another coach's clients; a coach sees client data only from the join date unless history access is granted; access ends when the link ends.
- **Coached athletes never see AI.** Entitlements are enforced server-side, not just hidden in the UI.
- **AI only server-side**, through `supabase/functions/_shared/ai/`. Check entitlement and the daily cap before calling; validate structured output against programming rules; never put health data in logs or error messages.
- **No secrets in the app or the repo.** Files go to S3 through signed URLs issued by Edge Functions.
- **Schema changes are migrations** in `supabase/migrations/` (`npx supabase migration new <name>`); never edit an applied migration.

## Before declaring work done

```bash
npm run lint && npm run typecheck && npm run db:test
```
