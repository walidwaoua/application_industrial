import React, { useState } from 'react';
import './sidebar.css';

const Sidebar = () => {
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <button className="nav-link active">
              <span className="nav-icon">📊</span>
              Tableau de bord
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">📝</span>
              Remplir formulaire
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">📈</span>
              Analyses
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">📦</span>
              Gestion Stock
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">🔧</span>
              Ateliers
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">👥</span>
              Utilisateurs
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">📋</span>
              Formulaires
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link">
              <span className="nav-icon">➕</span>
              Ajouter utilisateur
            </button>
          </li>
          <li className="nav-item dropdown">
            <button 
              className={`nav-link dropdown-toggle ${isAdminDropdownOpen ? 'active' : ''}`}
              onClick={toggleAdminDropdown}
            >
              <span className="nav-icon">⚙️</span>
              Administrator
              <span className={`dropdown-arrow ${isAdminDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`dropdown-menu ${isAdminDropdownOpen ? 'show' : ''}`}>
              <button className="dropdown-item">
                Paramètres système
              </button>
              <button className="dropdown-item">
                Logs d'activité
              </button>
              <button className="dropdown-item">
                Sauvegarde
              </button>
              <hr className="dropdown-divider" />
              <button className="dropdown-item danger">
                Déconnexion
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
