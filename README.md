# AgencyFlow AI

AgencyFlow AI is a premium agency client portal built with Next.js App Router, Tailwind CSS v4, and Supabase for auth, database, and storage.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase values when available.

- `NEXT_PUBLIC_SUPABASE_URL`: public project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for privileged operations in later phases
- `NEXT_PUBLIC_ENABLE_AUTH_GUARDS`: set to `true` once real auth is ready and `/app` routes should redirect unauthenticated visitors

## Current Phase 3 baseline

- real login, signup, and logout actions are wired through Supabase auth
- `/app` now performs server-side auth checks when Supabase envs are configured
- `supabase/migrations` contains the first core schema + RLS baseline for organizations, projects, workspaces, files, approvals, billing, notifications, and AI history
- the UI still falls back safely when Supabase env values have not been added yet

## Next steps

- apply the SQL migration in Supabase
- add your real Supabase keys to `.env.local`
- turn on `NEXT_PUBLIC_ENABLE_AUTH_GUARDS=true`
- continue wiring CRUD, storage uploads, approvals, and role-aware views
