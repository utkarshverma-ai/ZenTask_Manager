# ZenTask Manager

ZenTask Manager is a focused project-delivery workspace for teams that need clear ownership, deadlines, and task review. The browser client is built with React, TypeScript, and Vite; Supabase (PostgreSQL, Auth, Realtime, and Row Level Security) is the backend.

## Features

- Email/password authentication with persisted Supabase sessions
- Admin and member roles enforced by PostgreSQL RLS
- First authenticated user bootstrap to admin when no admin exists
- Project creation, editing, deletion, membership management, dates, and progress
- Task assignment, priority, deadlines, search, and filtering
- Member task workflow: **To Do → In Progress → Ready For Review**
- Admin review workflow, including completion or return to in-progress
- Required work summary when a member submits a task for review
- Realtime refreshes for projects, memberships, and tasks
- Workspace activity log, responsive app shell, and accessible dialogs

## Architecture

```text
frontend/                 React + TypeScript + Vite browser application
  src/app/                router and application providers
  src/components/         reusable layout and UI primitives
  src/features/           authentication and workspace pages
  src/lib/supabase/       Supabase client and database mapping
  src/services/           auth and workspace data operations
  src/styles/             build-owned global styling
backend/supabase/
  migrations/             immutable PostgreSQL/RLS migration history
```

## Tech stack

- Frontend: React 19, TypeScript, Vite, React Router, Lucide icons
- Backend: Supabase Auth, PostgreSQL, Row Level Security, Realtime

There is deliberately no Express or Node API layer. Supabase and PostgreSQL are the application's backend and authorization authority.

## Local development

1. Create a Supabase project.
2. Run the migrations in this exact order from the Supabase SQL Editor:

   1. [`202606010001_initial_schema.sql`](backend/supabase/migrations/202606010001_initial_schema.sql)
   2. [`202606010002_validate_task_assignee.sql`](backend/supabase/migrations/202606010002_validate_task_assignee.sql)
   3. [`202606010003_bootstrap_admin_and_membership_guard.sql`](backend/supabase/migrations/202606010003_bootstrap_admin_and_membership_guard.sql)
   4. [`202606020001_task_review_workflow.sql`](backend/supabase/migrations/202606020001_task_review_workflow.sql)

3. Configure the frontend:

   ```bash
   cd frontend
   cp .env.example .env.local
   ```

4. Set the public browser configuration in `frontend/.env.local`:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

Run from `frontend/`:

```bash
npm run dev        # start Vite locally
npm run typecheck  # TypeScript validation
npm run build      # typecheck and production build
npm run preview    # preview the production build
```

## Authorization model

RLS is enabled on `profiles`, `projects`, `project_members`, `tasks`, and `activity_logs`.

- Any authenticated user can view registered profiles.
- Members only read projects, memberships, tasks, and activity associated with projects they can access.
- Admins create, edit, and delete projects; manage project memberships; and create, edit, and delete tasks.
- A task assignee must be a member of its project.
- Removing a member with assigned tasks is rejected until those tasks are reassigned.
- Members can update only their own assigned task's status and work summary. The database trigger rejects all other field changes and invalid transitions.
- Admins retain broader task-management authority; client-side visibility is convenience only, never a security boundary.

The initial migration defines the basic schema and policies. The fourth migration replaces the former permissive task update policy with the review workflow policies and trigger, so it must not be skipped.

## Task review workflow

For an assigned member:

```text
To Do → In Progress → Ready For Review
```

Submitting for review requires a non-empty work summary. Admins can review a submitted task and complete it or send it back to in-progress. The `enforce_task_workflow` trigger is the final authority for this behavior.

## Deployment to Vercel

1. Import this repository in Vercel.
2. Set the Vercel Root Directory to `frontend`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's environment variables.
4. Deploy with the default build command, `npm run build`.
5. Add the deployed URL to Supabase Auth URL Configuration.

Use `frontend` as the Vercel Root Directory. [`frontend/vercel.json`](frontend/vercel.json) provides the SPA rewrite so BrowserRouter routes work after a direct refresh.

## Security and environment variables

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` belong in browser configuration. They are designed to be public and are protected by RLS.

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It must never be placed in a `VITE_` variable, committed to this repository, or used in browser code. If invitations or administrative user provisioning are added later, implement them in a trusted serverless/edge function.

## Known limitations

- Users must sign up before an administrator can change their role. The current product does not send invitations.
- There is no password-reset view, task attachment system, notification center, or audit export yet.
- End-to-end tests and Supabase RLS integration tests need a dedicated test project and are not included in this repository.

## Suggested next steps

1. Add a trusted Supabase Edge Function or Vercel serverless invitation flow.
2. Add Playwright coverage for the sign-in, member handoff, and admin review flows.
3. Add SQL RLS regression tests against a disposable Supabase project.
4. Add pagination and notifications as workspace volume grows.
