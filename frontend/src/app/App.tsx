import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './router';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { ToastProvider } from '../components/ui/ToastProvider';
export default function App() {
  if (!isSupabaseConfigured)
    return (
      <main className="configuration">
        <div>
          <p className="eyebrow">Configuration required</p>
          <h1>Connect ZenTask to Supabase</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then
            restart the frontend.
          </p>
        </div>
      </main>
    );
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
