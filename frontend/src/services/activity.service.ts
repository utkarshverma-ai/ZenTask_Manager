import { ActivityLog } from '../types';
import { getSupabase } from '../lib/supabase/client';
import { mapActivity } from '../lib/supabase/mappers';

export const activityService = {
  async listForEntity(entityType: ActivityLog['entityType'], entityId: string): Promise<ActivityLog[]> {
    const { data, error } = await getSupabase()
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapActivity);
  },
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
