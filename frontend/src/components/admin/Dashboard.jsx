import React, { useMemo } from 'react';
import StatCard from './widgets/StatCard';
import { kpis, activities } from './data/mockData';

export default function Dashboard() {
  const topKpis = useMemo(() => kpis.slice(0, 4), []);
  return (
    <div className="dash">
      <section className="grid-kpis">
        {topKpis.map(k => (
          <StatCard key={k.id} {...k} />
        ))}
      </section>

      <section className="panel two-col">
        <div className="panel-block">
          <h2 className="panel-title">Activité récente</h2>
          <ul className="activity-list">
            {activities.slice(0,8).map(a => (
              <li key={a.id}>
                <span className={`badge badge-${a.type}`}>{a.type}</span>
                <div className="act-body">
                  <div className="act-msg">{a.message}</div>
                  <div className="act-meta">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel-block">
          <h2 className="panel-title">Performance (démo)</h2>
          <div className="fake-chart">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="bar"
                style={{
                  height: (20 + Math.sin(i / 2) * 20 + Math.random() * 25) + '%',
                  animationDelay: (i * 0.07) + 's'
                }}
              />
            ))}
          </div>
          <p className="chart-note">
            Animation CSS de démonstration — remplace par un vrai graphique (Recharts, Chart.js, ECharts…)
            quand tu veux ajouter des dépendances.
          </p>
        </div>
      </section>
    </div>
  );
}