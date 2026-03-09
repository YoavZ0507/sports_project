# Athlete Task Hub MVP

Web-first MVP for coach-athlete task management with bilingual support (English/Hebrew), role-based routing, API contracts, and tests.

## Stack

- Next.js 15 + TypeScript
- In-memory repository adapter for local development
- Managed Postgres schema in `db/schema.sql` (Supabase-compatible)
- Vitest for unit/integration tests

## Key Capabilities Implemented

- Coach workspace creation
- Athlete join request + coach approval flow
- One-time and recurring task creation
- Task assignment to athletes
- Athlete progress submission with status, notes, and structured metrics
- Coach feedback on progress updates
- Dashboard summary: completion rate, overdue count, recent activity
- English/Hebrew dictionaries with RTL layout support for Hebrew views
- Route-level role guards via middleware (cookie-based)

## API Endpoints

- `POST /api/workspaces`
- `GET /api/workspaces`
- `POST /api/workspaces/:workspaceId/join`
- `POST /api/workspaces/:workspaceId/members/:memberId/approve`
- `GET|POST|PATCH /api/tasks`
- `GET|POST /api/progress`
- `GET|POST /api/feedback`
- `GET /api/dashboard`

## Demo UI Routes

- `/en/coach/dashboard`
- `/en/coach/athletes`
- `/en/coach/tasks`
- `/en/coach/progress`
- `/en/athlete/tasks`
- `/en/athlete/feedback`
- Same routes under `/he/*`

## Local Run

1. Install Node.js 20+
2. Install deps: `npm install`
3. Start: `npm run dev`
4. Run tests: `npm test`

## Auth and Backend Notes

- Current implementation uses request headers (`x-user-id`, `x-user-role`, `x-locale`) and middleware cookie `role` for role gating.
- Domain and API contracts are separated from storage so the in-memory repository can be replaced with a managed backend adapter.
- SQL schema in `db/schema.sql` defines the production data model.
