import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Stack, Chip, Divider, Avatar, Grid, Skeleton, Button } from '@mui/material';
import Header from './admin/Header';
import axios from 'axios';
import './profile.css';

function ensureAxiosAuth() {
  axios.defaults.baseURL = 'http://localhost:8000/api';
  const ls = localStorage.getItem('auth_user');
  const ss = sessionStorage.getItem('auth_user');
  const user = ls ? JSON.parse(ls) : (ss ? JSON.parse(ss) : null);
  if (user?.id) {
    axios.defaults.headers.common['Authorization'] = `Session ${user.id}`;
  }
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleLabel = useMemo(() => {
    const r = me?.role || localStorage.getItem('auth_role') || sessionStorage.getItem('auth_role');
    return r === 'admin' ? 'Administrateur' : 'Technicien';
  }, [me]);

  useEffect(() => {
    ensureAxiosAuth();
    (async () => {
      try {
        const { data } = await axios.get('/me/');
        setMe(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const name = me?.full_name || me?.username || '';
    return name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'U';
  }, [me]);

  return (
    <Box className="profile-root">
      <Header />

      {/* Hero */}
      <div className="profile-hero">
        <div className="sheen" />
        <div className="hero-inner">
          <div className="hero-left">
            <Avatar className="hero-avatar" variant="rounded">{initials}</Avatar>
            <div className="hero-meta">
              <div className="hero-title">{me?.full_name || 'Mon profil'}</div>
              <div className="hero-sub">@{me?.username}</div>
              <div className="hero-chips">
                <Chip label={roleLabel} className={`role-chip ${me?.role === 'admin' ? 'admin' : 'tech'}`} />
              </div>
            </div>
          </div>
        </div>
        <div className="orbs">
          <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
        </div>
      </div>

      <Box className="profile-content">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="card glass fadein">
              <div className="card-title">Identité</div>
              <Divider />
              {loading ? (
                <>
                  <Skeleton height={24} /><Skeleton height={24} /><Skeleton height={24} />
                </>
              ) : (
                <div className="card-body">
                  <div className="field"><span>Nom complet</span><b>{me?.full_name || '—'}</b></div>
                  <div className="field"><span>Nom d’utilisateur</span><b>{me?.username || '—'}</b></div>
                  <div className="field"><span>Rôle</span><b>{roleLabel}</b></div>
                  <div className="field"><span>ID interne</span><b>{me?.id}</b></div>
                </div>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="card glass fadein d2">
              <div className="card-title">Coordonnées</div>
              <Divider />
              {loading ? (
                <>
                  <Skeleton height={24} /><Skeleton height={24} /><Skeleton height={24} />
                </>
              ) : (
                <div className="card-body">
                  <div className="field"><span>Email</span><b>{me?.details?.email || '—'}</b></div>
                  <div className="field"><span>Nom</span><b>{me?.details?.nom || '—'}</b></div>
                  <div className="field"><span>Prénom</span><b>{me?.details?.prenom || '—'}</b></div>
                </div>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="card glass fadein d3">
              <div className="card-title">Informations RH</div>
              <Divider />
              {loading ? (
                <>
                  <Skeleton height={24} /><Skeleton height={24} />
                </>
              ) : (
                <div className="card-body">
                  <div className="field"><span>Date de naissance</span><b>{me?.details?.date_naissance || '—'}</b></div>
                  <div className="field"><span>Date d’embauche</span><b>{me?.details?.date_embauche || '—'}</b></div>
                </div>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} className="card glass fadein d4">
              <div className="card-title">Compte</div>
              <Divider />
              {loading ? (
                <>
                  <Skeleton height={24} /><Skeleton height={24} />
                </>
              ) : (
                <div className="card-body">
                  <div className="field"><span>Création</span><b>{(me?.created_at || '').toString().slice(0, 19).replace('T', ' ')}</b></div>
                  <div className="field"><span>Type</span><b>{me?.details?.type || me?.role}</b></div>
                </div>
              )}
              <div className="card-actions">
                <Button href="/settings" variant="contained" className="btn-green">Sécurité du compte</Button>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
