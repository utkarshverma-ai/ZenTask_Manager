import { ActivityLog } from '../types';
import { getSupabase } from '../lib/supabase/client';
import { mapActivity } from '../lib/supabase/mappers';

export const activityService = {
  async list(): Promise<ActivityLog[]> {
    const { data, error } = await getSupabase()
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(12);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapActivity);
  },
};
