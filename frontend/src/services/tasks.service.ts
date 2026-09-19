import { Task, TaskDraft, TaskStatus, User } from '../types';
import { getSupabase } from '../lib/supabase/client';
import { mapTask, toDb } from '../lib/supabase/mappers';

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export const tasksService = {
  async list(): Promise<Task[]> {
    const { data, error } = await getSupabase().from('tasks').select('*').order('due_date');
    throwIfError(error);
    return (data ?? []).map(mapTask);
  },

  async save(draft: TaskDraft, currentUser: User): Promise<void> {
    const payload = {
      project_id: draft.projectId,
      title: draft.title,
      description: draft.description,
      assigned_to: draft.assigneeId,
      status: toDb.taskStatus(draft.status),
      priority: toDb.priority(draft.priority),
      due_date: draft.dueDate,
      task_work_log: draft.workLog || '',
    };
    const result = draft.id
      ? await getSupabase().from('tasks').update(payload).eq('id', draft.id)
      : await getSupabase()
          .from('tasks')
          .insert({ ...payload, created_by: currentUser.id });
    throwIfError(result.error);
  },

  async updateStatus(id: string, status: TaskStatus, workLog: string): Promise<void> {
    const { error } = await getSupabase()
      .from('tasks')
      .update({ status: toDb.taskStatus(status), task_work_log: workLog })
      .eq('id', id);
    throwIfError(error);
  },

  async remove(id: string): Promise<void> {
    throwIfError((await getSupabase().from('tasks').delete().eq('id', id)).error);
  },
};
