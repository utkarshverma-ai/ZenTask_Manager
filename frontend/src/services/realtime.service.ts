import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase/client';

export const realtimeService = {
  subscribeToWorkspace(onChange: () => void): RealtimeChannel {
    return getSupabase()
      .channel('zentask-workspace')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
      .subscribe();
  },

  unsubscribe(channel: RealtimeChannel) {
    return getSupabase().removeChannel(channel);
  },
};
