import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <main className="dashboard-content">
          <h1>Tableau de bord Admin</h1>
          <section className="dashboard-cards">
            <div className="card">
              <h2>Total Utilisateurs</h2>
              <p>24</p>
            </div>
            <div className="card">
              <h2>Formulaires</h2>
              <p>156</p>
            </div>
            <div className="card">
              <h2>En Attente</h2>
              <p>8</p>
            </div>
            <div className="card">
              <h2>Complétés</h2>
              <p>148</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;