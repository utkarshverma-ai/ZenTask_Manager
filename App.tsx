
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { supabaseMock } from './services/supabaseMock';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseMock.auth.getSession();
      if (data.session) {
        setUser(data.session);
      }
      setInitializing(false);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await supabaseMock.auth.signOut();
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <div className="py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Simplify your workflow.</h1>
            <p className="mt-4 text-slate-500 max-w-lg mx-auto">ZenTask is the minimal task manager designed to help you focus on what matters most.</p>
          </div>
          <AuthForm onAuthSuccess={setUser} />
        </div>
      )}
    </Layout>
  );
};

export default App;
