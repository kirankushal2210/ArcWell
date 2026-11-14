# Arcwell

Training, nutrition and recovery in one Android app — a client-management platform for coaches, with an optional AI coach for athletes.

**Start with the product documents in [docs/product/](docs/product/README.md):** PRD, technical requirements, app flow, design brief, backend schema, API integrations, security and access, the AI guardrails ([AGENTS.md](AGENTS.md)) and the feature tickets. They're the source of truth; the older docs below are detail and history.

- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md)
- Investor demo: [docs/DEMO.md](docs/DEMO.md)
- Launch roadmap and costs: [docs/LAUNCH_ROADMAP.md](docs/LAUNCH_ROADMAP.md)
- History and detail: [SPEC.md](docs/SPEC.md), [PLAN.md](docs/PLAN.md), [DESIGN.md](docs/DESIGN.md)

## Repository layout

```
app/        Expo SDK 58 + React Native + TypeScript (Expo Router), Android-first
supabase/   Postgres migrations, pgTAP tests, seed data, Edge Functions
docs/       Product documents (docs/product/), decisions, design, roadmap
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
npm run lint           # ESLint, design tokens, static legal pages
npm run typecheck
npm run test           # Jest
npm run db:test        # pgTAP tests, including row-level security
npm run db:lint
```

## Secrets

Never commit secrets. Edge Function secrets live in `supabase/functions/.env` locally (see `.env.example`) and are set with `npx supabase secrets set` in staging and production. The mobile app only ever holds the Supabase URL and publishable key; AI keys and privileged operations stay server-side.
