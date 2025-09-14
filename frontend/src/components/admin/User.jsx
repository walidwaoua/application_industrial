// frontend/src/components/admin/User.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Tooltip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Slide, Snackbar, Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/PersonOutline";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./users.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ensureAxiosAuth() {
  axios.defaults.baseURL = 'http://localhost:8000/api';
  const ls = localStorage.getItem('auth_user');
  const ss = sessionStorage.getItem('auth_user');
  const user = ls ? JSON.parse(ls) : (ss ? JSON.parse(ss) : null);
  if (user?.id) {
    axios.defaults.headers.common['Authorization'] = `Session ${user.id}`;
  }
}

export default function User() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // (mot de passe direct supprimé de l'UI)

  // Confirm suppression
  const [delOpen, setDelOpen] = useState(false);
  const [delUser, setDelUser] = useState(null);

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  // Protection immédiate de la page Users
  useEffect(() => {
    const role = localStorage.getItem('auth_role') || sessionStorage.getItem('auth_role');
    if (role !== 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
    ensureAxiosAuth();
  }, [navigate]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/connexusers/');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ open: true, msg: "Accès refusé ou erreur de chargement", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(u =>
      `${u.username} ${u.role} ${u.full_name || ""}`.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  // (fonctionnalité de modification directe supprimée de l'UI)

  // Suppression
  const confirmDel = (u) => { setDelUser(u); setDelOpen(true); };
  const doDelete = async () => {
    try {
      await axios.delete(`/connexusers/${delUser.id}/`);
      setRows(r => r.filter(x => x.id !== delUser.id));
      setToast({ open: true, msg: "Utilisateur supprimé", sev: "success" });
    } catch (e) {
      setToast({ open: true, msg: "Suppression impossible", sev: "error" });
    } finally {
      setDelOpen(false);
    }
  };

  // Reset password: génère un code aleatoire et envoie par email
  const doResetAndEmail = async (u) => {
    try {
      await axios.post(`/connexusers/${u.id}/reset-password/`);
      setToast({ open: true, msg: "Mot de passe régénéré et envoyé par email", sev: "success" });
    } catch (e) {
      setToast({ open: true, msg: "Échec de la régénération / envoi", sev: "error" });
    }
  };

  return (
    <Box className="users-root">
      <Header />

      {/* Bandeau */}
      <Paper elevation={0} className="users-hero glass">
        <div className="hero-left">
          <Typography variant="h4" className="hero-title">
            <ShieldIcon className="hero-title-icon" /> Gestion des Utilisateurs
          </Typography>
          <Typography variant="body2" className="hero-sub">
            Liste, rôles, réinitialisation par email et suppression.
          </Typography>
        </div>
        <div className="hero-actions">
          <Tooltip title="Rafraîchir">
            <IconButton className="btn-icon" onClick={fetchRows}><RefreshIcon /></IconButton>
          </Tooltip>
        </div>
      </Paper>

      {/* Barre de recherche */}
      <Paper elevation={0} className="users-toolbar glass">
        <TextField
          placeholder="Rechercher par nom / rôle…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          }}
        />
        <div className="count">{filtered.length}</div>
      </Paper>

      {/* Tableau */}
      <TableContainer component={Paper} elevation={0} className="users-table glass">
        <Table stickyHeader>
          <TableHead>
            <TableRow className="thead">
              <TableCell>Utilisateur</TableCell>
              <TableCell>Nom complet</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="empty">Chargement…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="empty">Aucun utilisateur</TableCell></TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id} hover className="row">
                <TableCell className="cell">
                  <PersonIcon className="avatar" />
                  <span className="u">{u.username}</span>
                </TableCell>
                <TableCell className="cell">{u.full_name || "-"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.role}
                    className={u.role === "admin" ? "chip-admin" : "chip-tech"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Générer un mot de passe et envoyer par email">
                    <IconButton size="small" className="btn-icon" onClick={() => doResetAndEmail(u)}>
                      <ForwardToInboxIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" className="btn-icon danger" onClick={() => confirmDel(u)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de changement de mot de passe retiré */}

      {/* Confirm suppression */}
      <Dialog open={delOpen} onClose={() => setDelOpen(false)} TransitionComponent={Transition} keepMounted>
        <DialogTitle>Supprimer l’utilisateur</DialogTitle>
        <DialogContent dividers>
          <Typography>Confirmer la suppression de <b>{delUser?.username}</b> ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.sev}
          onClose={() => setToast(s => ({ ...s, open: false }))}
          variant="filled"
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
