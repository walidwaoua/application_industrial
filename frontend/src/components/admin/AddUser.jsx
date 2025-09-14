import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/PersonOutline";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import WorkIcon from "@mui/icons-material/WorkOutline";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import Header from "./Header"; // ajuste le chemin si besoin
import "./addUser.css";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "technicien", label: "Technicien" },
];

const API = "http://localhost:8000";

export default function AddUser() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    date_naissance: "",
    date_embauche: "",
    role: "technicien",
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const { nom, prenom, email, date_naissance } = formData;
    if (!nom.trim() || !prenom.trim() || !email.trim() || !date_naissance) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Merci de compléter les champs requis.",
      });
      return false;
    }
    // Email basique
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!okEmail) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Adresse e-mail invalide.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const url =
        formData.role === "admin"
          ? `${API}/api/admins/`
          : `${API}/api/techniciens/`;

      // Nettoyage du payload
      const { role, date_embauche, ...rest } = formData;
      const payload = { ...rest };
      if (!date_embauche) delete payload.date_embauche;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }

      setSnack({
        open: true,
        severity: "success",
        message: "Utilisateur ajouté avec succès ✅",
      });

      setFormData({
        nom: "",
        prenom: "",
        email: "",
        date_naissance: "",
        date_embauche: "",
        role: "technicien",
      });
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Erreur lors de l'ajout de l'utilisateur",
      });
    } finally {
      setSubmitting(false);
    }
  };
    
  return (
    <Box className="adduser-root">
      <Header />

      {/* Fond animé doux */}
      <div className="au-bg">
        <span className="au-blob b1" />
        <span className="au-blob b2" />
        <span className="au-blob b3" />
      </div>

      {/* Bandeau / Hero */}
      <Paper elevation={0} className="au-hero glass">
        <div className="au-hero-left">
          <Typography variant="h4" className="au-title">
            <ShieldIcon className="au-title-icon" /> Ajouter un utilisateur
          </Typography>
          <Typography variant="body2" className="au-sub">
           
          </Typography>
        </div>
      </Paper>

      {/* Carte du formulaire */}
      <Paper elevation={0} className="au-card glass">
        <form onSubmit={handleSubmit} className="au-form">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom *"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Prénom *"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Rôle"
                name="role"
                select
                value={formData.role}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date de naissance *"
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date d'embauche"
                type="date"
                name="date_embauche"
                value={formData.date_embauche}
                onChange={handleChange}
                fullWidth
                margin="normal"
                className="au-field"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Box className="au-actions">
            <Tooltip title="Enregistrer l'utilisateur">
              <span>
                <Button
                  type="submit"
                  variant="contained"
                  className="au-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={22} sx={{ color: "white" }} />
                  ) : (
                    "Ajouter"
                  )}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </form>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
