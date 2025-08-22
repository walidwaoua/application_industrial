import React from 'react';

export default function StatCard({ title, value, delta, icon }) {
  const positive = delta >= 0;
  return (
    <div className="stat-card">
      <div className="stat-icon" aria-hidden>{icon}</div>
      <div className="stat-main">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-delta ${positive ? 'up' : 'down'}`}>
          {positive ? '▲' : '▼'} {Math.abs(delta)}%
        </div>
      </div>
      <div className="pulse" />
    </div>
  );
}