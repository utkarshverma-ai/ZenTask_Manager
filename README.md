
# ZenTask Manager

A minimal, clean, and fully functional Task Management Web App built with React, TypeScript, Tailwind CSS, and a simulated Supabase backend.

## Tech Stack
- **React 18**: Frontend library.
- **TypeScript**: Type safety.
- **Tailwind CSS**: Utility-first styling.
- **Supabase (Mocked)**: Authentication and database management (persisted in LocalStorage for demonstration).
- **Lucide-like Icons**: SVG-based iconography.

## Authentication Flow
1. **Sign Up**: Users can create an account using email and password.
2. **Sign In**: Existing users can log in to access their dashboard.
3. **Session Management**: User session is maintained across refreshes using LocalStorage.
4. **Route Protection**: The Dashboard is only accessible to authenticated users; otherwise, the Auth form is shown.

## Database Schema
The application is designed to work with a Supabase table named `tasks`:
- `id`: (uuid, primary key) - Unique identifier for each task.
- `user_id`: (uuid, foreign key) - Links the task to a specific user in `auth.users`.
- `title`: (text) - The name of the task.
- `description`: (text) - Detailed info about the task.
- `status`: (text) - Enum: 'Todo', 'In Progress', 'Done'.
- `due_date`: (timestamp) - The date the task is due.
- `created_at`: (timestamp) - Auto-generated creation date.

## How Tasks are Linked to Users
Every task created stores the `user_id` of the logged-in user. When fetching tasks, the query includes a filter: `.eq('user_id', user.id)`, ensuring users can only view, edit, or delete their own data.

## Setup Instructions
1. **Clone/Download**: Copy the project files to your local environment.
2. **Install Dependencies**: Run `npm install`.
3. **Environment Setup**: 
   - To use a real Supabase instance, replace `services/supabaseMock.ts` with a real `createClient` setup from `@supabase/supabase-js`.
   - Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your `.env` file.
4. **Run Application**: Execute `npm start`.
5. **Supabase Table Setup**:
   ```sql
   CREATE TABLE tasks (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'Todo',
     due_date TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Policy for viewing own tasks
   CREATE POLICY "Users can see only their own tasks" ON tasks
     FOR SELECT USING (auth.uid() = user_id);

   -- Policy for inserting own tasks
   CREATE POLICY "Users can insert their own tasks" ON tasks
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Policy for updating own tasks
   CREATE POLICY "Users can update their own tasks" ON tasks
     FOR UPDATE USING (auth.uid() = user_id);

   -- Policy for deleting own tasks
   CREATE POLICY "Users can delete their own tasks" ON tasks
     FOR DELETE USING (auth.uid() = user_id);
   ```
