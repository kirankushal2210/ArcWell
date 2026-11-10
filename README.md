# Arcwell

Training, nutrition and recovery in one Android app — a client-management platform for coaches, with an optional AI coach for athletes.

- Product spec: [docs/SPEC.md](docs/SPEC.md)
- Implementation plan: [docs/PLAN.md](docs/PLAN.md)
- Design (principles, tokens, components, screens): [docs/DESIGN.md](docs/DESIGN.md)

## Repository layout

```
app/        Expo SDK 58 + React Native + TypeScript (Expo Router), Android-first
supabase/   Postgres migrations, pgTAP tests, seed data, Edge Functions
docs/       Spec and plan
```

## Prerequisites

- Node 24+
- Docker (for the local Supabase stack)
- Android device or emulator; Expo Go for quick runs, an EAS development build once native modules are added

## Getting started

```bash
npm install            # root: Supabase CLI
npm --prefix app install
npm run db:start       # local Postgres (or `npx supabase start` for the full stack)
npm run app:start      # Expo dev server
```

## Checks (also run in CI)

```bash
npm run lint
npm run typecheck
npm run db:test        # pgTAP tests, including row-level security
npm run db:lint
```

## Secrets

Never commit secrets. Edge Function secrets live in `supabase/functions/.env` locally (see `.env.example`) and are set with `npx supabase secrets set` in staging and production. The mobile app only ever holds the Supabase URL and anon key; AI keys and privileged operations stay server-side.
