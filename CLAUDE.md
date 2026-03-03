# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations (creates/updates dev.db)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:studio    # Open Prisma Studio (database browser)
```

No test suite is configured.

## Environment Setup

Copy `src/.env.local.example` to `.env` at the repo root and fill in:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-long-random-secret"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run `npm run db:migrate` once to create the SQLite database and apply the schema.

## Architecture

**JustDoIt** is a Next.js 16 (App Router) + SQLite/Prisma web app for workplace social event coordination. The core mechanic: events need a minimum attendee threshold to "happen," removing social risk from organizing.

### Route Structure

Two route groups via Next.js App Router:

- **`(auth)`** — `/login`, `/register`, `/join/[code]` — unauthenticated pages
- **`(app)`** — `/feed`, `/events/[eventId]`, `/events/create`, `/workspace/join` — requires auth

`src/proxy.ts` handles auth redirects: unauthenticated users → `/login`; authenticated users on auth routes → `/feed`. The `/join/[code]` route is intentionally public to allow invite link access.

### Data Flow

All data fetching uses **TanStack Query** (`@tanstack/react-query`) hitting Next.js API routes. The pattern:

1. Hooks in `src/hooks/` encapsulate `useQuery`/`useMutation` calls to `/api/*` routes
2. API routes in `src/app/api/` use Prisma to query SQLite
3. Query keys are centralized in `src/lib/query-keys.ts`

The `(app)` layout (`src/app/(app)/layout.tsx`) fetches the current user from `/api/auth/me`, loads workspaces, and auto-selects the first workspace.

### Auth

Custom JWT-based auth stored in an HTTP-only cookie named `session`:
- `src/lib/auth.ts` — sign/verify tokens, set/clear cookies (Node.js runtime)
- `src/lib/auth-edge.ts` — verify tokens only (Edge runtime, used in proxy)
- Passwords hashed with bcryptjs; tokens signed with HS256 via jose

### Workspace State

`WorkspaceProvider` (`src/providers/workspace-provider.tsx`) holds the currently active workspace in React context, persisted to `localStorage`. Components access it via `useWorkspaceContext()`. Most data queries are scoped to the active workspace.

### Database (Prisma + SQLite)

Schema: `prisma/schema.prisma`
Singleton client: `src/lib/prisma.ts`

**Models:** `User`, `Profile`, `Workspace`, `Membership`, `Event`, `Rsvp`

**Event status** (`pending` | `happening` | `at_risk` | `expired`) is recomputed in `src/lib/event-status.ts` (`recomputeEventStatus()`) after every RSVP change, mirroring the old Postgres trigger logic.

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/register` | POST | Create account, set session cookie |
| `/api/auth/login` | POST | Verify password, set session cookie |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/me` | GET | Return current user + profile |
| `/api/workspaces` | GET, POST | List user's workspaces, create workspace |
| `/api/workspaces/join` | POST | Join workspace by invite code |
| `/api/events` | GET, POST | List events for workspace, create event |
| `/api/events/[eventId]` | GET | Event detail + RSVPs |
| `/api/events/[eventId]/rsvps` | POST, DELETE | Upsert/withdraw RSVP |

### TypeScript Types

`src/lib/types/database.types.ts` contains plain interfaces: `Profile`, `Workspace`, `Membership`, `Event`, `Rsvp`, `EventWithCounts`.

### UI Components

Uses **shadcn/ui** (components in `src/components/ui/`) with Tailwind CSS v4 and `tailwind-merge`/`clsx` via `src/lib/utils.ts`. The React Compiler (`babel-plugin-react-compiler`) is enabled in `next.config.ts`.

Form validation uses **react-hook-form** + **zod**; schemas are in `src/lib/validators.ts`.

Toasts use **sonner** via `src/components/ui/sonner.tsx`.
