import React from 'react';
import './sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li><a href="#">Accueil</a></li>
        <li><a href="#">Utilisateurs</a></li>
        <li><a href="#">Paramètres</a></li>
        <li><a href="#">Déconnexion</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
