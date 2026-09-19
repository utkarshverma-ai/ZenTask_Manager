import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/auth.service';
import { getSupabase } from '../../lib/supabase/client';

type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  isPasswordRecovery: boolean;
  recoveryReady: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  useEffect(() => {
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setRecoveryReady(true);
        setUser(null);
        setError('');
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsPasswordRecovery(false);
        setRecoveryReady(true);
        setLoading(false);
        return;
      }
      if (!session) {
        setUser(null);
        setIsPasswordRecovery(false);
        setRecoveryReady(true);
        setLoading(false);
        return;
      }
      window.setTimeout(() => {
        void authService
          .getUserForSession(session)
          .then((profile) => {
            setUser(profile);
            setIsPasswordRecovery(false);
            setError('');
          })
          .catch((issue) => {
            setUser(null);
            setError(issue instanceof Error ? issue.message : 'Unable to restore your session.');
          })
          .finally(() => {
            setRecoveryReady(true);
            setLoading(false);
          });
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setIsPasswordRecovery(false);
  };
  const setAuthenticatedUser = (nextUser: User) => {
    setError('');
    setIsPasswordRecovery(false);
    setUser(nextUser);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, error, isPasswordRecovery, recoveryReady, setUser: setAuthenticatedUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
