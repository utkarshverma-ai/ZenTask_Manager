
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { isSupabaseConfigured, supabaseAuth } from './services/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await supabaseAuth.getSession();
        if (session) setUser(session);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to restore the session');
      } finally {
        setInitializing(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured) return (
    <Layout user={null} onLogout={() => undefined}>
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-xl font-bold">Supabase configuration required</h2>
        <p className="mt-2 text-sm">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart the app.</p>
      </div>
    </Layout>
  );

  return (
    <Layout user={user} onLogout={handleLogout}>
      {authError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{authError}</div>}
      {user ? (
        <Dashboard user={user} />
      ) : (
        <div className="py-12">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-blue-600">CENTRALIZED DELIVERY MANAGEMENT</p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Keep every project moving.</h1>
            <p className="mt-4 text-slate-500 max-w-lg mx-auto">Plan projects, assign owners, track deadlines, and give your team a clear view of execution.</p>
          </div>
          <AuthForm onAuthSuccess={setUser} />
        </div>
      )}
    </Layout>
  );
};

export default App;
