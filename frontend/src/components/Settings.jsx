import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Divider, TextField, Button, Snackbar, Alert, Grid, Avatar } from '@mui/material';
import Header from './admin/Header';
import axios from 'axios';
import './settings.css';

export default function Settings() {
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    // S'assure que l'en-tête Authorization est présent
    axios.defaults.baseURL = 'http://localhost:8000/api';
    const ls = localStorage.getItem('auth_user');
    const ss = sessionStorage.getItem('auth_user');
    const user = ls ? JSON.parse(ls) : (ss ? JSON.parse(ss) : null);
    if (user?.id) {
      axios.defaults.headers.common['Authorization'] = `Session ${user.id}`;
    }
  }, []);

  const resetPassword = async () => {
    if (!pwd || pwd.length < 6 || pwd !== pwd2) {
      setToast({ open: true, msg: 'Mot de passe invalide ou non identique', sev: 'warning' });
      return;
    }
    try {
      setSaving(true);
      await axios.post('http://localhost:8000/api/me/change-password/', { password: pwd });
      setPwd(''); setPwd2('');
      setToast({ open: true, msg: 'Mot de passe mis à jour', sev: 'success' });
    } catch (e) {
      setToast({ open: true, msg: 'Échec de mise à jour', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="settings-root">
      <Header />

      {/* Hero */}
      <div className="settings-hero">
        <div className="sheen" />
        <div className="settings-hero-inner">
          <Avatar className="settings-ic" variant="rounded">⚙️</Avatar>
          <div className="settings-meta">
            <div className="settings-title">Paramètres</div>
            <div className="settings-sub">Sécurité du compte et préférences</div>
          </div>
        </div>
        <div className="orbs">
          <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
        </div>
      </div>

      {/* Content */}
      <Box className="settings-content">
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="settings-card glass fadein">
              <div className="card-title">Sécurité du compte</div>
              <Divider />
              <div className="card-body">
                <TextField
                  type="password"
                  label="Nouveau mot de passe"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  helperText="Minimum 6 caractères"
                  fullWidth
                />
                <TextField
                  type="password"
                  label="Confirmer le mot de passe"
                  value={pwd2}
                  onChange={e => setPwd2(e.target.value)}
                  fullWidth
                />
                <div className="card-actions">
                  <Button variant="contained" className="btn-green" disabled={saving} onClick={resetPassword}>
                    {saving ? 'Mise à jour…' : 'Mettre à jour'}
                  </Button>
                </div>
              </div>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="settings-card glass fadein d2">
              <div className="card-title">Bonnes pratiques</div>
              <Divider />
              <ul className="tips">
                <li>Utiliser 10+ caractères (lettres, chiffres).</li>
                <li>Éviter les mots de passe réutilisés.</li>
                <li>Ne pas partager vos identifiants.</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToast(s => ({ ...s, open: false }))} severity={toast.sev} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
