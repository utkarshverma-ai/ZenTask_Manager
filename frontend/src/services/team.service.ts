import { User, UserRole } from '../types';
import { getSupabase } from '../lib/supabase/client';
import { mapUser } from '../lib/supabase/mappers';

export const teamService = {
  async list(): Promise<User[]> {
    const { data, error } = await getSupabase().from('profiles').select('id,email,full_name,role').order('full_name');
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapUser);
  },

  async updateRole(email: string, role: UserRole): Promise<User> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .update({ role: role.toLowerCase() })
      .eq('email', email.trim())
      .select('id,email,full_name,role')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No registered user was found with that email.');
    return mapUser(data);
  },
};
