import React from 'react';
import './sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li><a href="/">Accueil</a></li>
        <li><a href="/users">Utilisateurs</a></li>
        <li><a href="/settings">Paramètres</a></li>
        <li><a href="/logout">Déconnexion</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;