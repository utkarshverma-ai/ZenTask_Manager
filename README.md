
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
