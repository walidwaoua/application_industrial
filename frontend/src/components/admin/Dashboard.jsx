import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './dashboard.css';

const Dashboard = () => {
  // Mock data for demonstration
  const stats = {
    totalUsers: 156,
    totalForms: 89,
    pending: 23,
    completed: 66
  };

  const recentActivities = [
    { id: 1, action: "Nouveau formulaire créé", user: "Marie Dubois", time: "Il y a 5 min", type: "form" },
    { id: 2, action: "Utilisateur ajouté", user: "Jean Martin", time: "Il y a 12 min", type: "user" },
    { id: 3, action: "Analyse générée", user: "Sophie Laurent", time: "Il y a 25 min", type: "analysis" },
    { id: 4, action: "Stock mis à jour", user: "Pierre Blanc", time: "Il y a 1h", type: "stock" }
  ];

  const priorityActions = [
    { id: 1, title: "Réviser les formulaires en attente", urgent: true, count: 23 },
    { id: 2, title: "Mettre à jour l'inventaire", urgent: false, count: 5 },
    { id: 3, title: "Valider les nouvelles inscriptions", urgent: true, count: 8 }
  ];

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <div className="dashboard-content">
          <main className="main-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Bienvenue sur votre tableau de bord</h1>
              <p className="welcome-subtitle">Gérez efficacement vos opérations industrielles</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card users">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalUsers}</h3>
                  <p className="stat-label">Total Utilisateurs</p>
                  <div className="stat-trend positive">+12% ce mois</div>
                </div>
              </div>

              <div className="stat-card forms">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalForms}</h3>
                  <p className="stat-label">Formulaires</p>
                  <div className="stat-trend positive">+8% ce mois</div>
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.pending}</h3>
                  <p className="stat-label">En Attente</p>
                  <div className="stat-trend neutral">Nécessite attention</div>
                </div>
              </div>

              <div className="stat-card completed">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.completed}</h3>
                  <p className="stat-label">Complétés</p>
                  <div className="stat-trend positive">+15% ce mois</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
              {/* Recent Activity */}
              <div className="content-card activity-card">
                <div className="card-header">
                  <h2 className="card-title">Activité Récente</h2>
                  <button className="view-all-btn">Voir tout</button>
                </div>
                <div className="activity-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'form' && '📝'}
                        {activity.type === 'user' && '👤'}
                        {activity.type === 'analysis' && '📊'}
                        {activity.type === 'stock' && '📦'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-action">{activity.action}</p>
                        <p className="activity-user">par {activity.user}</p>
                      </div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Actions */}
              <div className="content-card priority-card">
                <div className="card-header">
                  <h2 className="card-title">Actions Prioritaires</h2>
                  <span className="priority-badge">{priorityActions.filter(a => a.urgent).length} urgent(s)</span>
                </div>
                <div className="priority-list">
                  {priorityActions.map(action => (
                    <div key={action.id} className={`priority-item ${action.urgent ? 'urgent' : ''}`}>
                      <div className="priority-content">
                        <h3 className="priority-title">{action.title}</h3>
                        <div className="priority-meta">
                          <span className="priority-count">{action.count} éléments</span>
                          {action.urgent && <span className="urgent-badge">Urgent</span>}
                        </div>
                      </div>
                      <button className="priority-btn">
                        →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="content-card stats-card">
                <div className="card-header">
                  <h2 className="card-title">Statistiques Rapides</h2>
                  <select className="period-select">
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                    <option value="year">Cette année</option>
                  </select>
                </div>
                <div className="quick-stats">
                  <div className="quick-stat-item">
                    <div className="quick-stat-value">92%</div>
                    <div className="quick-stat-label">Taux de completion</div>
                    <div className="quick-stat-bar">
                      <div className="quick-stat-progress" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <div className="quick-stat-item">
                    <div className="quick-stat-value">87%</div>
                    <div className="quick-stat-label">Satisfaction utilisateur</div>
                    <div className="quick-stat-bar">
                      <div className="quick-stat-progress" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div className="quick-stat-item">
                    <div className="quick-stat-value">76%</div>
                    <div className="quick-stat-label">Efficacité des processus</div>
                    <div className="quick-stat-bar">
                      <div className="quick-stat-progress" style={{width: '76%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
