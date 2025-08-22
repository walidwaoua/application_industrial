import React from 'react';

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth() || {};
  return (
    <header className="admin-topbar">
      <div className="left">
        <button className="burger" onClick={onMenu} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
        <h1 className="page-title">Administration</h1>
      </div>
      <div className="right">
        <div className="user-chip">
            <span className="initial">{user?.name?.[0]?.toUpperCase() || '?'}</span>
            <span className="info">
              <strong>{user?.name || 'User'}</strong>
              <small>{user?.role}</small>
            </span>
        </div>
        {logout && (
          <button className="logout-btn" onClick={logout}>
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
}