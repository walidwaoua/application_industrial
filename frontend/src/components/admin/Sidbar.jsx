import React from 'react';
import { NavLink } from 'react-router-dom';


export default function Sidebar({ collapsed, toggle }) {
  const { user } = useAuth() || {};

  const links = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Utilisateurs', icon: '👥', roles: ['admin','manager'] },
    { to: '/admin/settings', label: 'Paramètres', icon: '⚙️', roles: ['admin'] }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand" onClick={toggle}>
        <div className="logo">AI</div>
        {!collapsed && <div className="brand-text">Admin Panel</div>}
      </div>
      <div className="sidebar-user">
        <div className="avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
        {!collapsed && (
          <div className="meta">
            <div className="uname">{user?.name || 'Utilisateur'}</div>
            <div className="role">{user?.role || 'role'}</div>
          </div>
        )}
      </div>
      <nav className="nav-links">
        {links
          .filter(l => !l.roles || l.roles.includes(user?.role))
          .map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}
            >
              <span className="ni">{l.icon}</span>
              {!collapsed && <span>{l.label}</span>}
            </NavLink>
          ))}
      </nav>
      <button className="collapse-handle" onClick={toggle} aria-label="Collapse sidebar">
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}