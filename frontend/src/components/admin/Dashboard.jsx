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
        <div className="dashboard-content">
          <main>
            <h1>Bienvenue sur le tableau de bord administrateur</h1>
            <p>Utilisez le menu pour naviguer entre les sections.</p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
