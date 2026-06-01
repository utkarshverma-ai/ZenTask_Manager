
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">ZenTask</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-700">{user.name}</p><p className="text-xs text-slate-400">{user.role}</p></div>
              <button
                onClick={onLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
