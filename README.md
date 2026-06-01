# ZenTask Manager

A centralized Vite + React + TypeScript project delivery platform backed by Supabase.

## Live Demo

https://zen-task-manager.vercel.app/

## Features

- Supabase email/password authentication with persisted sessions
- `Admin` and `Member` authorization enforced by Postgres Row Level Security
- Project CRUD, project teams, start dates, due dates, and progress tracking
- Task CRUD, assignments, priorities, due dates, status tracking, search, and filtering
- Dashboard metrics, overdue detection, team directory, and recent activity
- Supabase Realtime refresh for projects, project assignments, and tasks
- Responsive layouts for desktop and mobile usage

## Local Setup

1. Create a Supabase Cloud project.
2. Run [`supabase/migrations/202606010001_initial_schema.sql`](supabase/migrations/202606010001_initial_schema.sql) in the Supabase SQL Editor.
3. Run [`supabase/migrations/202606010002_validate_task_assignee.sql`](supabase/migrations/202606010002_validate_task_assignee.sql) in the Supabase SQL Editor.
4. Run [`supabase/migrations/202606010003_bootstrap_admin_and_membership_guard.sql`](supabase/migrations/202606010003_bootstrap_admin_and_membership_guard.sql) in the Supabase SQL Editor.
5. Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key.
6. Start the frontend:

```bash
npm install
npm run dev
```

The first authenticated account is promoted to `admin` automatically when no admin exists. Later signups remain `member` accounts.

## Environment Variables

This repository is a Vite frontend, so browser-visible variables must use the `VITE_` prefix:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is reserved for a trusted backend or Vercel serverless function. Never expose it through a `VITE_` variable or commit it to Git.

If this frontend is later migrated to Next.js, the public equivalents should be renamed to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Security Model

The migrations enable RLS on every table. Database policies enforce the following:

- Authenticated users can read team profiles.
- Members can only read projects, memberships, tasks, and activity they are authorized to access.
- Admins create, update, and delete projects and manage project membership.
- Authorized project members create and update tasks.
- Task assignees must belong to the related project.
- Members with assigned tasks cannot be removed from a project until their tasks are reassigned.
- Only admins delete tasks.
- New signups receive the `member` role. The first authenticated user is promoted once when no admin exists; later role changes require an admin or trusted backend operation.
- Database constraints validate statuses, priorities, required dates, and title lengths.

## Vercel Deployment

1. Import `https://github.com/utkarshverma-ai/ZenTask_Manager` into Vercel or run `vercel`.
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project.
3. Deploy with `vercel --prod`.
4. Add the deployed Vercel URL to the Supabase Authentication URL Configuration.

## Known Limitations

- Secure invitation emails and admin-created Auth accounts require a trusted serverless function using `SUPABASE_SERVICE_ROLE_KEY`. The current UI promotes or demotes users who have already signed up.
- The schema supports activity history, but does not yet provide audit export or retention controls.
- Automated browser tests and RLS integration tests still need a configured Supabase test project.

## Next Iteration

1. Add a Vercel serverless invitation endpoint with service-role access.
2. Add password reset, email verification messaging, and invitation acceptance.
3. Add Playwright workflow coverage and SQL-based RLS regression tests.
4. Add pagination, notifications, file attachments, and audit export.
