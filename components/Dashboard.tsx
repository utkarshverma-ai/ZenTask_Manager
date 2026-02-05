
import React, { useState, useEffect } from 'react';
import { supabaseMock } from '../services/supabaseMock';
import { Task, TaskStatus, SortOrder, User } from '../types';
import { TaskModal } from './TaskModal';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabaseMock
      .from('tasks')
      .select()
      .eq('user_id', user.id)
      .order('due_date', { ascending: sortOrder === 'asc' });
    
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user.id, sortOrder]);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await supabaseMock.from('tasks').update(taskData).eq('id', editingTask.id);
    } else {
      await supabaseMock.from('tasks').insert({ ...taskData, user_id: user.id });
    }
    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await supabaseMock.from('tasks').delete().eq('id', id);
      fetchTasks();
    }
  };

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case TaskStatus.IN_PROGRESS: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
          <p className="text-slate-500">Manage your daily workflow and priorities</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Task
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['All', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Due Date {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading tasks...</div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{task.title}</h3>
                  <p className="text-slate-600 text-sm">{task.description}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(task.status)}`}>
                  {task.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center space-y-2">
            <p className="text-slate-500 font-medium">No tasks found</p>
            <p className="text-slate-400 text-sm">Get started by creating your first task.</p>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};
