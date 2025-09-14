import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Header from "./admin/Header";

import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Button,
  Grid, Card, CardHeader, CardContent, Collapse, Chip, Divider, Tooltip,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton, Grow
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/AddRounded";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import FactoryIcon from "@mui/icons-material/FactoryOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ClearIcon from "@mui/icons-material/Clear";

import "./atelier.css";

// Base URL du backend (change via REACT_APP_API_URL si besoin)
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const http = axios.create({ baseURL: `${API}/api/` });

export default function Atelier() {
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [newAtelier, setNewAtelier] = useState("");
  const [newEquipement, setNewEquipement] = useState("");
  const [selectedAtelier, setSelectedAtelier] = useState(null);

  const [openIds, setOpenIds] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState({ type: null, atelierId: null, equipementId: null });

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => { fetchAteliers(); }, []);

  const fetchAteliers = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("ateliers/");
      setAteliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchAteliers:", err?.response || err);
      setToast({ open: true, msg: "Impossible de charger les ateliers", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAtelier = async () => {
    const nom = newAtelier.trim();
    if (!nom) return;
    try {
      const { data } = await http.post("ateliers/", { nom });
      setAteliers((prev) => [...prev, data]);
      setNewAtelier("");
      setToast({ open: true, msg: "Atelier ajouté ", sev: "success" });
    } catch (e) {
      console.error("add atelier:", e?.response || e);
      setToast({ open: true, msg: "Échec de l’ajout de l’atelier", sev: "error" });
    }
  };

  const askDeleteAtelier = (atelierId) => {
    setToDelete({ type: "atelier", atelierId, equipementId: null });
    setConfirmOpen(true);
  };

  const askDeleteEquipement = (atelierId, equipementId) => {
    setToDelete({ type: "equipement", atelierId, equipementId });
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    try {
      if (toDelete.type === "atelier") {
        await http.delete(`ateliers/${toDelete.atelierId}/`);
        setAteliers((prev) => prev.filter((a) => a.id !== toDelete.atelierId));
        setToast({ open: true, msg: "Atelier supprimé", sev: "success" });
      } else if (toDelete.type === "equipement") {
        await http.delete(`equipements/${toDelete.equipementId}/`);
        setAteliers((prev) =>
          prev.map((a) =>
            a.id === toDelete.atelierId
              ? { ...a, equipements: (a.equipements || []).filter((e) => e.id !== toDelete.equipementId) }
              : a
          )
        );
        setToast({ open: true, msg: "Équipement supprimé", sev: "success" });
      }
    } catch (e) {
      console.error("delete:", e?.response || e);
      setToast({ open: true, msg: "Suppression impossible", sev: "error" });
    } finally {
      setConfirmOpen(false);
      setToDelete({ type: null, atelierId: null, equipementId: null });
    }
  };

  const handleAddEquipement = async () => {
    const nom = newEquipement.trim();
    if (!nom || !selectedAtelier) return;
    try {
      const { data } = await http.post("equipements/", { nom, atelier: selectedAtelier });
      setAteliers((prev) =>
        prev.map((a) =>
          a.id === selectedAtelier ? { ...a, equipements: [...(a.equipements || []), data] } : a
        )
      );
      setNewEquipement("");
      setToast({ open: true, msg: "Équipement ajouté ", sev: "success" });
    } catch (e) {
      console.error("add equipement:", e?.response || e);
      setToast({ open: true, msg: "Échec de l’ajout de l’équipement", sev: "error" });
    }
  };

  const toggleOpen = (id) => setOpenIds((s) => ({ ...s, [id]: !s[id] }));

  const filteredAteliers = useMemo(() => {
    const n = query.trim().toLowerCase();
    if (!n) return ateliers;
    return ateliers.filter((a) => `${a.nom}`.toLowerCase().includes(n));
  }, [ateliers, query]);

  return (
    <Box className="at-root">
      <Header />

      {/* Fond animé */}
      <div className="at-bg">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
      </div>

      {/* Bandeau */}
      <Grow in timeout={500}>
        <Paper elevation={0} className="at-hero glass">
          <div className="hero-left">
            <Typography variant="h4" className="hero-title">
              <FactoryIcon className="hero-icon" /> Gestion des Ateliers
            </Typography>
            <Typography variant="body2" className="hero-sub">
              Ajoute, recherche, et gère les équipements.
            </Typography>
          </div>

          <div className="hero-actions">
            <TextField
              className="search"
              size="small"
              placeholder="Rechercher un atelier…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setQuery("")}><ClearIcon /></IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </div>
        </Paper>
      </Grow>

      {/* Ajout Atelier */}
      <Paper elevation={0} className="at-toolbar glass">
        <TextField
          label="Nom de l’atelier"
          value={newAtelier}
          onChange={(e) => setNewAtelier(e.target.value)}
          className="at-field"
        />
        <Tooltip title="Ajouter un atelier">
          <span>
            <Button
              variant="contained"
              onClick={handleAddAtelier}
              className="at-btn"
              startIcon={<AddIcon />}
              disabled={!newAtelier.trim()}
            >
              Ajouter
            </Button>
          </span>
        </Tooltip>
      </Paper>

      {/* Liste */}
      <Grid container spacing={2} className="at-grid">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Paper className="glass" style={{ padding: 12 }}>
                <Skeleton variant="rounded" height={140} />
              </Paper>
            </Grid>
          ))
        ) : filteredAteliers.length === 0 ? (
          <Grid item xs={12}>
            <Paper className="glass empty"><Typography>Aucun atelier trouvé</Typography></Paper>
          </Grid>
        ) : (
          filteredAteliers.map((atelier) => (
            <Grid item xs={12} md={6} lg={4} key={atelier.id}>
              <Card elevation={0} className="at-card glass hover-float">
                <CardHeader
                  className="at-card-header"
                  avatar={<FactoryIcon className="avatar" />}
                  title={<span className="at-name">{atelier.nom}</span>}
                  subheader={<span className="at-sub">{atelier.equipements?.length || 0} équipement(s)</span>}
                  action={
                    <>
                      <Tooltip title={openIds[atelier.id] ? "Réduire" : "Ouvrir"}>
                        <IconButton onClick={() => toggleOpen(atelier.id)} className="btn-icon">
                          {openIds[atelier.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer l’atelier">
                        <IconButton onClick={() => askDeleteAtelier(atelier.id)} className="btn-icon danger">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                />
                <Collapse in={Boolean(openIds[atelier.id])} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent className="at-card-content">
                    <Typography variant="subtitle2" className="eq-title">Équipements</Typography>

                    <div className="eq-list">
                      {(atelier.equipements || []).map((eq) => (
                        <Chip
                          key={eq.id}
                          icon={<InventoryIcon />}
                          label={eq.nom}
                          className="eq-chip"
                          onDelete={() => askDeleteEquipement(atelier.id, eq.id)}
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                      {(atelier.equipements || []).length === 0 && (
                        <Typography className="eq-empty">Aucun équipement</Typography>
                      )}
                    </div>

                    <div className="eq-add">
                      <TextField
                        size="small"
                        label="Nom de l’équipement"
                        value={selectedAtelier === atelier.id ? newEquipement : ""}
                        onChange={(e) => { setSelectedAtelier(atelier.id); setNewEquipement(e.target.value); }}
                        className="at-field"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddEquipement}
                        disabled={!newEquipement.trim() || selectedAtelier !== atelier.id}
                        className="at-btn-outline"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent dividers>
          {toDelete.type === "atelier"
            ? <Typography>Supprimer cet atelier et tous ses équipements ?</Typography>
            : <Typography>Supprimer cet équipement ?</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button onClick={doDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast(s => ({ ...s, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
