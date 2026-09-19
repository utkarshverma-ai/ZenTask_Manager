import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
  const authEventVersion = useRef(0);
  const recoveryMode = useRef(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((event, session) => {
      const eventVersion = ++authEventVersion.current;

      if (event === 'PASSWORD_RECOVERY') {
        recoveryMode.current = true;
        setIsPasswordRecovery(true);
        setRecoveryReady(true);
        setUser(null);
        setError('');
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        recoveryMode.current = false;
        setUser(null);
        setIsPasswordRecovery(false);
        setRecoveryReady(true);
        setLoading(false);
        return;
      }
      if (!session) {
        if (recoveryMode.current) {
          setRecoveryReady(true);
          setLoading(false);
          return;
        }
        setUser(null);
        setIsPasswordRecovery(false);
        setRecoveryReady(true);
        setLoading(false);
        return;
      }

      if (recoveryMode.current) {
        setRecoveryReady(true);
        setLoading(false);
        return;
      }

      window.setTimeout(() => {
        void authService
          .getUserForSession(session)
          .then((profile) => {
            if (eventVersion !== authEventVersion.current || recoveryMode.current) return;
            setUser(profile);
            setIsPasswordRecovery(false);
            setError('');
          })
          .catch((issue) => {
            if (eventVersion !== authEventVersion.current || recoveryMode.current) return;
            setUser(null);
            setError(issue instanceof Error ? issue.message : 'Unable to restore your session.');
          })
          .finally(() => {
            if (eventVersion !== authEventVersion.current || recoveryMode.current) return;
            setRecoveryReady(true);
            setLoading(false);
          });
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  const logout = async () => {
    authEventVersion.current += 1;
    recoveryMode.current = false;
    await authService.signOut();
    setUser(null);
    setIsPasswordRecovery(false);
  };
  const setAuthenticatedUser = (nextUser: User) => {
    authEventVersion.current += 1;
    recoveryMode.current = false;
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
