import { Project, ProjectDraft, User } from '../types';
import { getSupabase } from '../lib/supabase/client';
import { mapProject, toDb } from '../lib/supabase/mappers';

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

async function syncMembers(projectId: string, draft: ProjectDraft, currentUser: User) {
  const db = getSupabase();
  const ownerId = draft.ownerId ?? currentUser.id;
  const desiredIds = [...new Set([ownerId, ...draft.memberIds])];
  const { data: existingMembers, error } = await db
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId);
  throwIfError(error);

  const existingIds = (existingMembers ?? []).map((member) => member.user_id);
  const additions = desiredIds
    .filter((id) => !existingIds.includes(id))
    .map((user_id) => ({ project_id: projectId, user_id, role: user_id === ownerId ? 'owner' : 'member' }));
  if (additions.length) throwIfError((await db.from('project_members').insert(additions)).error);

  const removals = existingIds.filter((id) => id !== ownerId && !desiredIds.includes(id));
  if (removals.length) {
    throwIfError((await db.from('project_members').delete().eq('project_id', projectId).in('user_id', removals)).error);
  }
}

export const projectsService = {
  async list(): Promise<Project[]> {
    const { data, error } = await getSupabase()
      .from('projects')
      .select('*,project_members(user_id)')
      .order('created_at', { ascending: false });
    throwIfError(error);
    return (data ?? []).map(mapProject);
  },

  async save(draft: ProjectDraft, currentUser: User): Promise<void> {
    const db = getSupabase();
    const payload = {
      name: draft.name,
      description: draft.description,
      status: toDb.projectStatus(draft.status),
      start_date: draft.startDate || null,
      due_date: draft.dueDate,
    };
    let projectId = draft.id;

    if (projectId) {
      throwIfError((await db.from('projects').update(payload).eq('id', projectId)).error);
    } else {
      const { data, error } = await db
        .from('projects')
        .insert({ ...payload, created_by: currentUser.id })
        .select('id')
        .single();
      throwIfError(error);
      projectId = data.id;
    }

    await syncMembers(projectId, draft, currentUser);
  },

  async remove(id: string): Promise<void> {
    throwIfError((await getSupabase().from('projects').delete().eq('id', id)).error);
  },
};
