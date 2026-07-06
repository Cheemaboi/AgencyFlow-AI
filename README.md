# AgencyFlow AI

Phase 1 foundation for a premium agency client portal built with Next.js App Router, Tailwind CSS v4, and Supabase-ready utilities.

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

## Phase 1 coverage

- public marketing, login, and signup routes
- authenticated app shell scaffold
- reusable card, button, input, badge, tabs, and stat components
- green design tokens with dark-mode planning
- Supabase browser/server helpers and proxy-based auth guard plan
