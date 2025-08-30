import React from 'react';
import './header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Tableau de bord</h1>
          <div className="breadcrumb">
            <span className="breadcrumb-item">Administration</span>
            <span className="breadcrumb-separator">•</span>
            <span className="breadcrumb-item active">Tableau de bord</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          <div className="header-notifications">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
          </div>
          <div className="header-user">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrateur</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
