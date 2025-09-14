import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Tooltip, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Snackbar, Alert, Button, MenuItem, Divider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TablePagination, Stack, Slide
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import "./formList.css";
import Header from "./admin/Header"; // Importation de la Navbar

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FormList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // UI state
  const [query, setQuery] = useState("");
  const [etat, setEtat] = useState("tous");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRpp] = useState(10);

  // Delete dialog
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Edit dialog (inline on this page)
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editFields, setEditFields] = useState({
    piece_rechange: "",
    travaux_effectues: "",
    etat_action_immediate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/formulaires/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setSnack({ open: true, message: "Erreur de chargement des formulaires", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statusColor = (s) => {
    const v = (s || "").toLowerCase();
    if (v.includes("fait")) return "success";
    if (v.includes("cours")) return "info";
    if (v.includes("non")) return "warning";
    return "default";
  };

  // ------ filtre + recherche (sur noms lisibles) ------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      const etatVal = (r.etat_action_immediate || r.etat_immediate || "").toLowerCase();
      const okEtat = etat === "tous" || etatVal === etat;
      if (!okEtat) return false;

      if (!q) return true;
      const atelierTxt = r.atelier_details?.nom ?? String(r.atelier ?? "");
      const equipTxt   = r.equipement_details?.nom ?? String(r.equipement ?? "");
      const hay = (
        `${r.id} ${atelierTxt} ${equipTxt} ${r.nature_panne} ${r.cause_panne} ` +
        `${r.pilote} ${r.methode_entretien} ${r.indice_gravite}`
      ).toLowerCase();
      return hay.includes(q);
    });

    // tri décroissant par date (si présent)
    list.sort((a, b) => String(b.date_defaillance || "").localeCompare(String(a.date_defaillance || "")));
    return list;
  }, [rows, query, etat]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/formulaires/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSnack({ open: true, message: "Formulaire supprimé avec succès", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditFields({
      piece_rechange: row.piece_rechange || "",
      travaux_effectues: row.travaux_effectues || "",
      etat_action_immediate: row.etat_action_immediate || row.etat_immediate || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editRow) return;
    try {
      const res = await fetch(`http://localhost:8000/api/formulaires/${editRow.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFields),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSnack({ open: true, message: "Formulaire mis à jour", severity: "success" });
      setEditOpen(false);
      setEditRow(null);
    } catch {
      setSnack({ open: true, message: "Échec de la mise à jour", severity: "error" });
    }
  };
  const handleView = (id) => navigate(`/forms/${id}`);

  return (
    <Box>
      <Header /> {/* Ajout de la Navbar */}
      <Box className="formlist-root">
        {/* hero */}
        <Paper elevation={0} className="list-hero glass">
          <div className="hero-left">
            <Typography variant="h4" className="hero-title">Formulaires</Typography>
            <Typography variant="body2" className="hero-sub">Gestion et suivi des fiches d’anomalie</Typography>
            <div className="hero-stats">
              <Chip icon={<CalendarMonthIcon />} label={`${rows.length} au total`} className="stat-chip" />
              <Chip icon={<AccessTimeIcon />} label="Recherche + pagination" className="stat-chip" />
            </div>
          </div>
          <div className="hero-actions">
            <Tooltip title="Nouveau formulaire">
              <Button className="btn-add" variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/form")}>
                Nouveau
              </Button>
            </Tooltip>
            <Tooltip title="Rafraîchir">
              <IconButton className="btn-refresh" onClick={fetchData}><RefreshIcon /></IconButton>
            </Tooltip>
          </div>
        </Paper>

        {/* toolbar */}
        <Paper elevation={0} className="list-toolbar glass">
          <TextField
            placeholder="Rechercher (atelier, équipement, pilote, nature...)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            className="search-field"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="État"
            className="filter-field"
            value={etat}
            onChange={(e) => { setEtat(e.target.value); setPage(0); }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="tous">Tous</MenuItem>
            <MenuItem value="non traité">Non traité</MenuItem>
            <MenuItem value="en cours">En cours</MenuItem>
            <MenuItem value="fait">Fait</MenuItem>
          </TextField>
          <div className="spacer" />
          <div className="toolbar-right">
            <span className="count-badge">{filtered.length}</span>
          </div>
        </Paper>

        {/* table */}
        <TableContainer component={Paper} elevation={0} className="list-table glass">
          <Table size="medium" stickyHeader>
            <TableHead>
              <TableRow className="thead-row">
                <TableCell className="th">ID</TableCell>
                <TableCell className="th">Atelier</TableCell>
                <TableCell className="th">Équipement</TableCell>
                <TableCell className="th">Date</TableCell>
                <TableCell className="th hide-sm">Début</TableCell>
                <TableCell className="th hide-sm">Fin</TableCell>
                <TableCell className="th hide-md">Méthode</TableCell>
                <TableCell className="th">Nature</TableCell>
                <TableCell className="th hide-lg">Cause</TableCell>
                <TableCell className="th hide-lg">Gravité</TableCell>
                <TableCell className="th hide-md">Pièces</TableCell>
                <TableCell className="th hide-md">Travaux</TableCell>
                <TableCell className="th">État</TableCell>
                <TableCell className="th">Pilote</TableCell>
                <TableCell className="th hide-md">Durée</TableCell>
                <TableCell className="th actions">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`} className="row loading">
                    {Array.from({ length: 16 }).map((__, j) => (
                      <TableCell key={`skc-${i}-${j}`}><div className="skeleton" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow className="row">
                  <TableCell colSpan={16} align="center" className="empty">
                    <Typography>Aucun résultat</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((r) => {
                  const etatVal = r.etat_action_immediate || r.etat_immediate || "";
                  return (
                    <TableRow key={r.id} hover className="row">
                      <TableCell>{r.id}</TableCell>

                      {/* 👇 Affiche NOM si dispo sinon ID */}
                      <TableCell className="cell-ellipsis">
                        {r.atelier_details?.nom ?? r.atelier}
                      </TableCell>
                      <TableCell className="cell-ellipsis">
                        {r.equipement_details?.nom ?? r.equipement}
                      </TableCell>

                      <TableCell>{r.date_defaillance}</TableCell>
                      <TableCell className="hide-sm">{r.heure_debut}</TableCell>
                      <TableCell className="hide-sm">{r.heure_fin}</TableCell>
                      <TableCell className="hide-md cell-ellipsis">{r.methode_entretien}</TableCell>
                      <TableCell className="cell-ellipsis">{r.nature_panne}</TableCell>
                      <TableCell className="hide-lg cell-ellipsis">{r.cause_panne}</TableCell>
                      <TableCell className="hide-lg">{r.indice_gravite}</TableCell>
                      <TableCell className="hide-md cell-ellipsis">{r.piece_rechange}</TableCell>
                      <TableCell className="hide-md cell-ellipsis">{r.travaux_effectues}</TableCell>
                      <TableCell>
                        <Chip label={etatVal || "—"} color={statusColor(etatVal)} size="small" className="chip-etat" />
                      </TableCell>
                      <TableCell className="cell-ellipsis">{r.pilote}</TableCell>
                      <TableCell className="hide-md">{r.heuregen}</TableCell>

                      <TableCell className="actions">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" className="btn-icon" onClick={() => openEdit(r)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              className="btn-icon danger"
                              onClick={() => setConfirm({ open: true, id: r.id })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Divider />
          <TablePagination
            component="div"
            className="pagination"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes/ page"
          />
        </TableContainer>

        {/* confirm dialog */}
        <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}>
          <DialogTitle>Supprimer le formulaire</DialogTitle>
          <DialogContent>
            <DialogContentText>Cette action est irréversible. Confirmer la suppression ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirm({ open: false, id: null })}>Annuler</Button>
            <Button color="error" variant="contained" onClick={() => handleDelete(confirm.id)}>Supprimer</Button>
          </DialogActions>
        </Dialog>

        {/* edit dialog */}
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          fullWidth
          maxWidth="sm"
          TransitionComponent={Transition}
          PaperProps={{ className: "edit-dialog glass" }}
        >
          <DialogTitle className="edit-title">
            Modifier le formulaire #{editRow?.id}
            {editRow && (
              <Typography variant="caption" className="edit-sub">
                {editRow.atelier_details?.nom || ''} {editRow.equipement_details ? '• ' + editRow.equipement_details.nom : ''}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Pièces de rechange"
              value={editFields.piece_rechange}
              onChange={(e) => setEditFields(f => ({ ...f, piece_rechange: e.target.value }))}
              fullWidth margin="dense" multiline rows={3}
            />
            <TextField
              label="Travaux effectués"
              value={editFields.travaux_effectues}
              onChange={(e) => setEditFields(f => ({ ...f, travaux_effectues: e.target.value }))}
              fullWidth margin="dense" multiline rows={3}
            />
            <TextField
              select
              label="État immédiat"
              value={editFields.etat_action_immediate}
              onChange={(e) => setEditFields(f => ({ ...f, etat_action_immediate: e.target.value }))}
              fullWidth margin="dense"
            >
              {['', 'Non traité', 'En cours', 'Fait'].map(v => (
                <MenuItem key={v || 'empty'} value={v}>{v || '—'}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions className="edit-actions">
            <Button onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button variant="contained" className="btn-green" onClick={saveEdit}>Enregistrer</Button>
          </DialogActions>
        </Dialog>

        {/* snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant="filled" sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
