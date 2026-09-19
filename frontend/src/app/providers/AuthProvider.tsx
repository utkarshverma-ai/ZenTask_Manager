import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/auth.service';
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    void (async () => {
      try {
        setUser(await authService.getSession());
      } catch (issue) {
        setError(issue instanceof Error ? issue.message : 'Unable to restore your session.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };
  const setAuthenticatedUser = (nextUser: User) => {
    setError('');
    setUser(nextUser);
  };
  return (
    <AuthContext.Provider value={{ user, loading, error, setUser: setAuthenticatedUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
