import React, { useState, useMemo } from 'react';
import { usersMock } from './data/mockData';

const ROLES = ['admin','manager','editor','viewer'];

export default function Users() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = useMemo(() => {
    return usersMock.filter(u => {
      const matchQ = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
      const matchR = roleFilter === 'all' || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [query, roleFilter]);

  return (
    <div className="users-page">
      <div className="panel">
        <div className="panel-head">
          <h2>Utilisateurs</h2>
          <div className="filters">
            <input
              placeholder="Recherche nom ou email..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">Tous rôles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className="btn-primary" onClick={() => alert('Implémente création')}>
              + Ajouter
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-chip role-${u.role}`}>{u.role}</span></td>
                  <td>{u.active ? 'Actif' : 'Inactif'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => alert('Voir ' + u.name)}>Voir</button>
                    <button className="btn-sm warn" onClick={() => alert('Edit ' + u.name)}>Edit</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} style={{ textAlign:'center', padding:'2rem' }}>
                    Aucun résultat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}