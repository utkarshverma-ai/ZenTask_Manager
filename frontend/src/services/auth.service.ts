import { User, UserRole } from '../types';
import { getSupabase, supabase } from '../lib/supabase/client';
import { mapUser } from '../lib/supabase/mappers';
const fail = (error: { message: string } | null) => { if (error) throw new Error(error.message); };
async function profileFor(id: string, fallback?: { email?: string; user_metadata?: { full_name?: string } }): Promise<User> {
  const { data, error } = await getSupabase().from('profiles').select('id,email,full_name,role').eq('id', id).maybeSingle();
  if (error) fail(error);
  if (!data) return { id, email: fallback?.email ?? '', name: fallback?.user_metadata?.full_name ?? '', role: UserRole.MEMBER };
  const profile = mapUser(data);
  if (profile.role === UserRole.MEMBER) { const { data: bootstrapped, error: rpcError } = await getSupabase().rpc('bootstrap_initial_admin'); fail(rpcError); if (bootstrapped) return { ...profile, role: UserRole.ADMIN }; }
  return profile;
}
export const authService = {
  async signUp(email: string, password: string, fullName: string) { const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { full_name: fullName } } }); fail(error); if (!data.user) throw new Error('Signup did not return an account.'); if (!data.session) throw new Error('Account created. Check your email to confirm your account, then sign in.'); return profileFor(data.user.id, data.user); },
  async signIn(email: string, password: string) { const { data, error } = await getSupabase().auth.signInWithPassword({ email, password }); fail(error); return profileFor(data.user.id, data.user); },
  async signOut() { const { error } = await getSupabase().auth.signOut(); fail(error); },
  async getSession() { if (!supabase) return null; const { data, error } = await supabase.auth.getSession(); fail(error); return data.session ? profileFor(data.session.user.id, data.session.user) : null; },
};
