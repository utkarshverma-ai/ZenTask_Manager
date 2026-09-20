import { LogOut, Menu, Users, CheckSquare, LayoutDashboard, FolderKanban, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { initials } from '../../utils/workspace';
import { AppFooter } from './AppFooter';
const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/team', label: 'Team', icon: Users },
];
export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <img className="brand-icon" src="/brand/zentask-icon.png" alt="" aria-hidden="true" />
          <strong>ZenTask</strong>
          <button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <div className="avatar">{initials(user.name)}</div>
          <div className="account-copy">
            <strong>{user.name || 'Workspace member'}</strong>
            <span>{user.role}</span>
          </div>
          <button className="icon-button" onClick={() => void logout()} aria-label="Sign out">
            <LogOut />
          </button>
        </div>
      </aside>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <span className="eyebrow">Workspace</span>
          <div className="topbar-user">
            <div className="avatar">{initials(user.name)}</div>
            <span>{user.name}</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
