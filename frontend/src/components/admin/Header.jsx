import React from 'react';
import './header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <span className="admin-label">Admin</span>
        <h1 className="dashboard-title">Dashboard</h1>
      </div>
      <nav className="header-nav">
        <a href="/">Tableau de bord</a>
        <a href="/form">Remplir formulaire</a>
        <a href="/analytics">Analyses</a>
        <a href="/stock">Gestion Stock</a>
        <a href="/workshops">Ateliers</a>
        <a href="/users">Utilisateurs</a>
        <a href="/forms">Formulaires</a>
        <a href="/admin/add-user">Ajouter utilisateur</a>
      </nav>
      <div className="header-right">
        <span>Administrateur</span>
        <button className="admin-button">Admin</button>
      </div>
    </header>
  );
};

export default Header;