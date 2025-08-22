import React, { useState } from 'react';

export default function Settings() {
  const [form, setForm] = useState({
    siteName: 'Plateforme Industrielle',
    theme: 'dark',
    notifications: true
  });

  return (
    <div className="settings-page">
      <div className="panel">
        <h2>Paramètres</h2>
        <form
          className="settings-form"
          onSubmit={e => {
            e.preventDefault();
            alert('Sauvegardé (démo)');
          }}
        >
          <label>
            Nom du site
            <input
              value={form.siteName}
              onChange={e => setForm(f => ({ ...f, siteName: e.target.value }))}
            />
          </label>
          <label>
            Thème
            <select
              value={form.theme}
              onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
            >
              <option value="dark">Sombre</option>
              <option value="light">Clair</option>
              <option value="system">Système</option>
            </select>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={e => setForm(f => ({ ...f, notifications: e.target.checked }))}
            />
            Notifications email
          </label>
          <div className="actions">
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}