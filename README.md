## 🌐 Live Demo

(https://zen-task-manager.vercel.app/)

## Tech Stack

- **Next.js (App Router)** – Frontend framework for building the web application  
- **TypeScript** – Type safety and better code maintainability  
- **Tailwind CSS** – Simple and responsive UI styling  
- **Supabase**
  - **Authentication** – Email & password based login/signup
  - **PostgreSQL Database** – Storing user-specific tasks

---

## Authentication Flow

1. Users can **sign up or log in** using email and password via Supabase Auth.  
2. After successful authentication, Supabase creates a **secure user session**.  
3. Protected routes ensure that only **authenticated users** can access the dashboard.  
4. On page refresh, the app **checks the existing session** to keep the user logged in.

---

## Database Structure

### `tasks` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (Primary Key) | Unique task identifier |
| user_id | uuid (Foreign Key → auth.users) | Links task to a specific user |
| title | text | Task title |
| description | text | Task details |
| status | text | `todo`, `in_progress`, `done` |
| due_date | timestamp | Task deadline |
| created_at | timestamp | Task creation time |

---

## How Tasks Are Linked to Users

- Each task stores the **`user_id`** of the authenticated user.  
- When fetching tasks, queries are **filtered by the current user’s ID**.  
- This ensures users can **only view, update, or delete their own tasks**, maintaining proper data isolation and security.

---

## Assumptions Made

- Each user manages **only their personal tasks**.  
- Task status values are limited to **Todo, In Progress, and Done**.  
- Filtering and sorting are handled **on the client side for simplicity**.  
- Basic responsive UI is sufficient since the focus is on **functionality and correctness**, not advanced design.
