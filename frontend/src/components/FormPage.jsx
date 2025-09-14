import React, { useState, useEffect, useMemo } from 'react';
import Header from './admin/Header';
import {
  Box, TextField, Button, Typography, Paper, MenuItem, Grid,
  Divider, Fade, CircularProgress, Snackbar, Alert, Tooltip
} from '@mui/material';
import './formPage.css';

/* === Listes de choix === */
const METHODES = [
  "Dépannage",
  "Réparation",
  "Amélioration",
  "Entretien préventif conditionnel",
  "Entretien systématique",
];

const CAUSES = [
  "Manque d'entretien",
  "Surcharges",
  "Mauvaise manipulation",
  "Cause de conception inadéquate",
  "Incident imprévisible",
  "Re-Works",
  "Durée de vie",
];

const GRAVITES = [
  "Intervention programmable dans le mois",
  "Intervention programmable dans la semaine",
  "Intervention nécessaire dans les 48 heures",
  "Intervention nécessaire dans les heures qui suivent (risque de perte de production)",
  "Intervention immédiate (Perte de production)",
];

/* 👉 Nouvelles options pour NATURE DE PANNE */
const NATURES_PANNE = [
  "Origine électrique",
  "Origine Mécanique",
  "Origine lubrification",
  "Origine pneumatique ou hydraulique",
  "Origine conception générale machine",
];

/* 👉 Nouveau select ÉTAT IMMÉDIAT */
const ETATS_IMMEDIAT = ["Non traité", "En cours", "Fait"];

export default function FormPage() {
  const [formData, setFormData] = useState({
    atelier: '',
    equipement: '',
    date_defaillance: '',
    heure_debut: '',
    heure_fin: '',
    methode_entretien: '',
    nature_panne: '',
    cause_panne: '',
    indice_gravite: '',
    piece_rechange: '',
    travaux_effectues: '',
    etat_action_immediate: '',          // Correction du nom du champ
    pilote: '',
  });

  const [ateliers, setAteliers] = useState([]);
  const [equipements, setEquipements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [aRes, eRes] = await Promise.all([
          fetch('http://localhost:8000/api/ateliers/'),
          fetch('http://localhost:8000/api/equipements/')
        ]);
        const [aData, eData] = await Promise.all([aRes.json(), eRes.json()]);
        if (!mounted) return;
        setAteliers(aData || []);
        setEquipements(eData || []);
      } catch (err) {
        setSnack({ open: true, message: "Erreur de chargement des listes", severity: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'atelier') {
      // Quand l'atelier change, on réinitialise l'équipement si non-concordant
      const aid = Number(value) || null;
      setFormData(prev => {
        let next = { ...prev, atelier: value };
        if (prev.equipement) {
          const selectedEq = equipements.find(eq => Number(eq.id) === Number(prev.equipement));
          if (!selectedEq || Number(selectedEq.atelier) !== aid) {
            next.equipement = '';
          }
        }
        return next;
      });
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Liste d'équipements filtrée par atelier sélectionné
  const filteredEquipements = useMemo(() => {
    const aid = Number(formData.atelier) || null;
    if (!aid) return equipements;
    return equipements.filter(e => Number(e.atelier) === aid);
  }, [equipements, formData.atelier]);

  // Validation minimale
  const requiredFields = ['atelier', 'equipement', 'date_defaillance', 'heure_debut', 'nature_panne', 'pilote'];
  const getError = (name) => requiredFields.includes(name) && !formData[name] ? "Champ requis" : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = requiredFields.some(k => !formData[k]);
    if (hasErrors) {
      setSnack({ open: true, message: "Merci de compléter les champs requis", severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/formulaires/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      setSnack({ open: true, message: "Formulaire envoyé avec succès ", severity: 'success' });
      setFormData({
        atelier: '',
        equipement: '',
        date_defaillance: '',
        heure_debut: '',
        heure_fin: '',
        methode_entretien: '',
        nature_panne: '',
        cause_panne: '',
        indice_gravite: '',
        piece_rechange: '',
        travaux_effectues: '',
        etat_action_immediate: '', // Correction du nom du champ
        pilote: '',
      });
    } catch (error) {
      setSnack({ open: true, message: "Échec d’envoi. Réessaie.", severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const selPlaceholder = '— Sélectionner —';

  return (
    <Box className="form-page-container">
      <Header />

      {/* Fond animé doux */}
      <div className="bg-anim">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <Box className="form-content">
        <Fade in timeout={600}>
          <Paper elevation={0} className="form-container glass-card">
            <Typography variant="h4" className="title" gutterBottom>Fiche d’anomalie</Typography>
            <Typography variant="body2" className="subtitle" gutterBottom>
              Renseigne les informations ci-dessous. Les champs marqués * sont requis.
            </Typography>

            <Divider className="divider" />

            {loading ? (
              <Box className="loading">
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>Chargement des listes…</Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit} className="form-grid">
                {/* ========= CONTEXTE ========= */}
                <Typography variant="overline" className="section-label">Contexte</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select label="Atelier *" name="atelier" fullWidth
                      value={formData.atelier} onChange={handleChange}
                      margin="normal" helperText={getError('atelier')} error={!!getError('atelier')}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>{selPlaceholder}</MenuItem>
                      {ateliers.map((a) => <MenuItem key={a.id} value={a.id}>{a.nom}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select label="Équipement *" name="equipement" fullWidth
                      value={formData.equipement} onChange={handleChange}
                      disabled={!formData.atelier}
                      margin="normal" helperText={getError('equipement')} error={!!getError('equipement')}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>{selPlaceholder}</MenuItem>
                      {filteredEquipements.map((e) => (
                        <MenuItem key={e.id} value={e.id}>{e.nom}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Date de défaillance *" type="date" name="date_defaillance" fullWidth
                      value={formData.date_defaillance} onChange={handleChange}
                      margin="normal" InputLabelProps={{ shrink: true }}
                      helperText={getError('date_defaillance')} error={!!getError('date_defaillance')}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Heure de début *" type="time" name="heure_debut" fullWidth
                      value={formData.heure_debut} onChange={handleChange}
                      margin="normal" InputLabelProps={{ shrink: true }}
                      helperText={getError('heure_debut')} error={!!getError('heure_debut')}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Heure de fin" type="time" name="heure_fin" fullWidth
                      value={formData.heure_fin} onChange={handleChange}
                      margin="normal" InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Divider className="divider" />

                {/* ========= DIAGNOSTIC ========= */}
                <Typography variant="overline" className="section-label">Diagnostic</Typography>
                <Grid container spacing={2}>
                  {/* 1ère ligne : Nature de la panne = SELECT pleine largeur */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Nature de la panne *"
                      name="nature_panne"
                      value={formData.nature_panne}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      className="select-full"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (v) => v ? v : selPlaceholder,
                      }}
                      InputLabelProps={{ shrink: true }}
                      helperText={getError('nature_panne')}
                      error={!!getError('nature_panne')}
                    >
                      <MenuItem value="">{selPlaceholder}</MenuItem>
                      {NATURES_PANNE.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </TextField>
                  </Grid>

                  {/* 2e ligne : 3 colonnes égales */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Cause de la panne"
                      name="cause_panne"
                      value={formData.cause_panne}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      className="select-full"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (v) => v ? v : selPlaceholder,
                      }}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">{selPlaceholder}</MenuItem>
                      {CAUSES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Indice de gravité"
                      name="indice_gravite"
                      value={formData.indice_gravite}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      className="select-full"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (v) => v ? v : selPlaceholder,
                      }}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">{selPlaceholder}</MenuItem>
                      {GRAVITES.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Méthode d’entretien"
                      name="methode_entretien"
                      value={formData.methode_entretien}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      className="select-full"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (v) => v ? v : selPlaceholder,
                      }}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">{selPlaceholder}</MenuItem>
                      {METHODES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                  </Grid>

                  {/* 3e ligne : pièces, travaux, ÉTAT IMMÉDIAT (nouveau select) */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Pièces de rechange" name="piece_rechange" fullWidth
                      value={formData.piece_rechange} onChange={handleChange}
                      margin="normal" multiline rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Travaux effectués" name="travaux_effectues" fullWidth
                      value={formData.travaux_effectues} onChange={handleChange}
                      margin="normal" multiline rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="État immédiat"
                      name="etat_action_immediate"
                      value={formData.etat_action_immediate}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      className="select-full"
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (v) => v ? v : selPlaceholder,
                      }}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">{selPlaceholder}</MenuItem>
                      {ETATS_IMMEDIAT.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>

                <Divider className="divider" />

                {/* ========= RESPONSABLE ========= */}
                <Typography variant="overline" className="section-label">Responsable</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Tooltip title="Personne pilote / responsable de la fiche" arrow>
                      <TextField
                        label="Pilote *" name="pilote" fullWidth
                        value={formData.pilote} onChange={handleChange}
                        margin="normal" helperText={getError('pilote')} error={!!getError('pilote')}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>

                <Box className="actions">
                  <Button type="submit" variant="contained" className="submit-button" disabled={submitting}>
                    {submitting ? <CircularProgress size={22} /> : "Envoyer la fiche"}
                  </Button>
                </Box>
              </form>
            )}
          </Paper>
        </Fade>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))}
               severity={snack.severity}
               variant="filled"
               sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
