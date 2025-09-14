import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Tooltip, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Snackbar, Alert, Button, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Slide, TablePagination, Stack, useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import InventoryIcon from "@mui/icons-material/Inventory2";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Header from "./admin/Header";
import "./stock.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Stock() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // UI
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRpp] = useState(10);

  // Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState({ id: null, reference: "", element: "", quantite: "" });
  const fullScreen = useMediaQuery("(max-width: 720px)");

  // Confirm delete
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => { fetchRows(); }, []);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/stocks/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setSnack({ open: true, message: "Erreur de chargement des stocks", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (item = { id: null, reference: "", element: "", quantite: "" }) => {
    setCurrent(item);
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setCurrent((p) => ({ ...p, [name]: name === "quantite" ? value.replace(/[^\d-]/g, "") : value }));
  };

  const save = async () => {
    try {
      if (!current.reference?.trim() || !current.element?.trim() || current.quantite === "") {
        setSnack({ open: true, message: "Complète tous les champs obligatoires.", severity: "warning" });
        return;
      }

      const payload = {
        reference: current.reference.trim(),
        element: current.element.trim(),
        quantite: Number(current.quantite),
      };

      const method = current.id ? "PUT" : "POST";
      const url = current.id
        ? `http://localhost:8000/api/stocks/${current.id}/`
        : "http://localhost:8000/api/stocks/";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      setSnack({ open: true, message: "Stock enregistré avec succès", severity: "success" });
      closeDialog();
      fetchRows();
    } catch {
      setSnack({ open: true, message: "Erreur lors de l'enregistrement", severity: "error" });
    }
  };

  const askDelete = (id) => setConfirm({ open: true, id });
  const doDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/stocks/${confirm.id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((r) => r.id !== confirm.id));
      setSnack({ open: true, message: "Élément supprimé", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  // ------- recherche + pagination -------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (!q) return true;
      const hay = `${r.reference} ${r.element} ${r.quantite}`.toLowerCase();
      return hay.includes(q);
    });
    // tri alphabétique par référence puis élément
    list.sort((a, b) => String(a.reference || "").localeCompare(String(b.reference || "")));
    return list;
  }, [rows, query]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Badge de quantité
  const qtyChipProps = (q) => {
    const n = Number(q);
    if (isNaN(n)) return { color: "default", label: q };
    if (n <= 0) return { color: "error", label: `${n}` };
    if (n <= 5) return { color: "warning", label: `${n}` };
    return { color: "success", label: `${n}` };
  };

  return (
    <Box className="stock-root">
      <Header />

      {/* HERO */}
      <Paper elevation={0} className="stock-hero glass">
        <div className="hero-left">
          <Typography variant="h4" className="hero-title">
            <InventoryIcon className="hero-icon" /> Gestion des stocks
          </Typography>
          <Typography variant="body2" className="hero-sub">
            Suivi des références et quantités. 
          </Typography>
          <div className="hero-stats">
            <Chip label={`${rows.length} articles`} className="stat-chip" />
          </div>
        </div>
        <div className="hero-actions">
          <Tooltip title="Ajouter un article">
            <Button className="btn-add" variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
              Ajouter
            </Button>
          </Tooltip>
          <Tooltip title="Rafraîchir">
            <IconButton className="btn-refresh" onClick={fetchRows}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>

      {/* TOOLBAR */}
      <Paper elevation={0} className="stock-toolbar glass">
        <TextField
          placeholder="Rechercher (référence, élément...)"
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
        <div className="spacer" />
        <div className="toolbar-right">
          <span className="count-badge">{filtered.length}</span>
        </div>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} className="stock-table glass">
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow className="thead-row">
              <TableCell className="th">Référence</TableCell>
              <TableCell className="th">Élément</TableCell>
              <TableCell className="th">Quantité</TableCell>
              <TableCell className="th actions">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className="row loading">
                  <TableCell><div className="skeleton" /></TableCell>
                  <TableCell><div className="skeleton" /></TableCell>
                  <TableCell><div className="skeleton short" /></TableCell>
                  <TableCell><div className="skeleton short" /></TableCell>
                </TableRow>
              ))
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" className="empty">
                  <Typography>Aucun résultat</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((r) => (
                <TableRow key={r.id} hover className="row">
                  <TableCell className="cell-ellipsis">{r.reference}</TableCell>
                  <TableCell className="cell-ellipsis">{r.element}</TableCell>
                  <TableCell>
                    <Chip size="small" className="chip-qty" {...qtyChipProps(r.quantite)} />
                  </TableCell>
                  <TableCell className="actions">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Modifier">
                        <IconButton size="small" className="btn-icon" onClick={() => openDialog(r)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          className="btn-icon danger"
                          onClick={() => askDelete(r.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
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

      {/* EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullScreen={fullScreen}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ className: "edit-dialog" }}
      >
        <DialogTitle className="edit-title">
          <InventoryIcon /> {current.id ? "Modifier" : "Ajouter"} un article
        </DialogTitle>
        <DialogContent dividers className="edit-content">
          <TextField
            label="Référence *"
            name="reference"
            fullWidth
            value={current.reference}
            onChange={onChangeField}
            margin="normal"
          />
          <TextField
            label="Élément *"
            name="element"
            fullWidth
            value={current.element}
            onChange={onChangeField}
            margin="normal"
          />
          <TextField
            label="Quantité *"
            name="quantite"
            type="number"
            fullWidth
            value={current.quantite}
            onChange={onChangeField}
            margin="normal"
          />
        </DialogContent>
        <DialogActions className="edit-actions">
          <Button startIcon={<CloseIcon />} onClick={closeDialog}>Annuler</Button>
          <Button
            variant="contained"
            className="btn-save"
            startIcon={<SaveIcon />}
            onClick={save}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE */}
      <Dialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>Supprimer l’article</DialogTitle>
        <DialogContent dividers>
          <Typography>Cette action est irréversible. Confirmer la suppression ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null })}>Annuler</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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
