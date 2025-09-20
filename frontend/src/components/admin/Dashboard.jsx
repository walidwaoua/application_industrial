import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import {
  Box, CssBaseline, ThemeProvider, createTheme,
  Typography, IconButton, Tooltip, Chip, Avatar,
  Paper, Divider, Skeleton, Button
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import "./dashboard.css";

/* =================== API =================== */
const API = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const ENDPOINTS = {
  techniciens: `${API}/api/techniciens/`,
  admins: `${API}/api/admins/`,
  forms: `${API}/api/formulaires/`,
  stocks: `${API}/api/stocks/`,
  stats: `${API}/api/stats/`,
};

const theme = createTheme({
  palette: {
    primary: { main: "#2e7d32" },
    secondary: { main: "#43a047" },
    background: { default: "#f6faf7" },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: `"Inter", system-ui, Segoe UI, Arial, sans-serif` },
});

/* ================== Utils ================== */
function useCountUp(value, duration = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start, from = 0, to = Number(value || 0);
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return n;
}
const extractDate = (o) =>
  o?.created_at || o?.date_creation || o?.created || o?.createdAt || o?.date || null;

const byNewest = (a, b) => {
  const da = extractDate(a), db = extractDate(b);
  if (da && db) return new Date(db) - new Date(da);
  return (b?.id || 0) - (a?.id || 0);
};

/* Mappe any modèle de stock -> structure homogène */
function mapStock(it) {
  const qty = Number(it.quantity ?? it.quantite ?? it.qte ?? it.stock ?? 0);

  // essaie un maximum d'alias possibles pour le seuil
  const rawMin =
    it.min_quantity ??
    it.seuil ??
    it.seuil_alerte ??
    it.seuilCritique ??
    it.seuil_critique ??
    it.stock_min ??
    it.stockMin ??
    it.min ??
    it.minimum ??
    it.qte_min ??
    it.quantite_min ??
    it.quantity_min ??
    it.reorder_level ??
    it.reorderLevel ??
    it.alert_threshold ??
    null;

  const minQty =
    rawMin === null || rawMin === undefined || rawMin === ""
      ? null
      : Number(rawMin);

  return {
    id: it.id,
    reference: it.reference || it.ref || it.code || it.reference_stock || "",
    name:
      it.element ||
      it.designation ||
      it.name ||
      it.libelle ||
      it.nom ||
      "Article",
    quantity: qty,
    minQty,                          // <= peut être null
    unit: it.unit || it.unite || "",
  };
}

/* Agrège les formulaires par nature de panne */
function aggregateNatures(forms) {
  const counts = {};
  forms.forEach((f) => {
    const nature = (f.nature_panne || f.nature || "").toString().trim();
    if (!nature) return;
    counts[nature] = (counts[nature] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([nature, count]) => ({ nature, count }))
    .sort((a, b) => b.count - a.count);
}

/* =========== Hook data (fallback automatique) =========== */
function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    counts: { users: 0, techniciens: 0, admins: 0, forms: 0 },
    recentForms: [],
    formsAll: [],
    stockAlerts: { rupture: [], critical: [] },
  });
  const timerRef = useRef(null);

  const buildFromFallback = async () => {
    const [t, a, f, s, stat] = await Promise.all([
      fetch(ENDPOINTS.techniciens).then(r => r.json()).catch(() => []),
      fetch(ENDPOINTS.admins).then(r => r.json()).catch(() => []),
      fetch(ENDPOINTS.forms).then(r => r.json()).catch(() => []),
      fetch(ENDPOINTS.stocks).then(r => r.json()).catch(() => []),
      fetch(ENDPOINTS.stats).then(r => (r.ok ? r.json() : null)).catch(() => null),
    ]);

    const techniciens = Array.isArray(t) ? t.length : (t?.count ?? 0);
    const admins = Array.isArray(a) ? a.length : (a?.count ?? 0);
    const users = stat?.user_count ?? (techniciens + admins);
    const forms = Array.isArray(f) ? f.length : (f?.count ?? 0);

    const formsList = Array.isArray(f) ? f : (f?.results ?? []);
    const recentForms = formsList.sort(byNewest).slice(0, 8);

    const stocksList = Array.isArray(s) ? s : (s?.results ?? []);
    const mapped = stocksList.map(mapStock);

    // rupture = quantité <= 0
    const rupture = mapped.filter(x => x.quantity <= 0);

    // critique = quantité > 0 ET (min défini ? q <= min : q <= 2)
    const critical = mapped.filter(x =>
      x.quantity > 0 &&
      (
        (x.minQty && x.minQty > 0) ? (x.quantity <= x.minQty) : (x.quantity <= 2)
      )
    );

    return {
      counts: { users, techniciens, admins, forms },
      recentForms,
      formsAll: formsList,
      stockAlerts: { rupture, critical }
    };
  };

  const fetchOnce = async () => {
    try {
      setLoading(true);
      setData(await buildFromFallback());
    } catch {
      setData(await buildFromFallback());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, 10000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return { loading, data, reload: fetchOnce };
}

/* ================== UI pieces ================== */
function KPICard({ icon, label, value, hint }) {
  const v = useCountUp(value);
  return (
    <Paper elevation={0} className="dp-card dp-kpi glass">
      <div className="kpi-left">
        <Avatar className="kpi-ic" variant="rounded">{icon}</Avatar>
        <div className="kpi-meta">
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{v}</div>
        </div>
      </div>
      {hint && <Chip label={hint} size="small" className="kpi-chip" />}
    </Paper>
  );
}

function StockRow({ level, name, quantity, minQty, unit }) {
  const isRupture = level === "rupture";
  return (
    <div className="row stock">
      <Avatar className={`row-ic ${isRupture ? "rupture" : "critical"}`} variant="rounded">
        {isRupture ? <ErrorOutlineIcon /> : <WarningAmberIcon />}
      </Avatar>
      <div className="row-main">
        <div className="row-title">{name}</div>
        <div className="row-sub">
          {isRupture ? "Rupture de stock" : `Seuil ${minQty}${unit ? " " + unit : ""}`}
        </div>
      </div>
      <Chip
        label={`${quantity}${unit ? " " + unit : ""}`}
        size="small"
        className={`qchip ${isRupture ? "rupture" : "critical"}`}
      />
    </div>
  );
}

function RecentRow({ title, sub }) {
  return (
    <div className="row">
      <Avatar className="row-ic" variant="rounded"><DescriptionIcon /></Avatar>
      <div className="row-main">
        <div className="row-title">{title}</div>
        {sub ? <div className="row-sub">{sub}</div> : null}
      </div>
    </div>
  );
}

/* ================== Page ================== */
export default function DashboardPro() {
  const { loading, data, reload } = useDashboardData();

  const kpis = [
    { label: "Utilisateurs", value: data.counts.users, icon: <PeopleAltIcon />, hint: "Total" },
    { label: "Techniciens", value: data.counts.techniciens, icon: <EngineeringIcon />, hint: "Actifs" },
    { label: "Admins", value: data.counts.admins, icon: <AdminPanelSettingsIcon />, hint: "Rôle" },
    { label: "Formulaires", value: data.counts.forms, icon: <DescriptionIcon />, hint: "Entrés" },
  ];

  // Agrégation par nature (sur l’ensemble des formulaires)
  const natureCounts = useMemo(
    () => aggregateNatures(data.formsAll || data.recentForms || []),
    [data.formsAll, data.recentForms]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="dp-root">
        <Header />

        {/* fond animé */}
        <div className="dp-bg">
          <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
        </div>

        <div className="dp-container">
          {/* HERO */}
          <Paper elevation={0} className="dp-hero glass">
            <div>
              <Typography variant="h4" className="hero-title">Tableau de bord</Typography>
              <Typography variant="body2" className="hero-sub">
                Vue d’ensemble — actions récentes, effectifs et alerte stock.
              </Typography>
            </div>
            <Tooltip title="Actualiser">
              <IconButton className="hero-refresh" onClick={reload}><RefreshIcon /></IconButton>
            </Tooltip>
          </Paper>

          {/* KPI GRID */}
          <section className="grid-kpi">
            {kpis.map((k, i) => (
              <div key={i}>
                {loading ? (
                  <Paper elevation={0} className="dp-card dp-kpi glass">
                    <Skeleton variant="rounded" width={44} height={44} />
                    <div className="kpi-meta">
                      <Skeleton height={18} width="60%" />
                      <Skeleton height={32} width="40%" />
                    </div>
                    <div className="kpi-right"><Skeleton height={24} width={64} /></div>
                  </Paper>
                ) : (
                  <KPICard {...k} />
                )}
              </div>
            ))}
          </section>

          {/* PANELS GRID */}
          <section className="grid-panels">
            {/* Actions récentes (agrégées par nature) */}
            <Paper elevation={0} className="dp-card panel glass">
              <div className="panel-head">
                <div className="panel-title">Actions récentes</div>
                <Button size="small" className="panel-link" href="/form-list">Voir tout</Button>
              </div>
              <Divider />
              <div className="panel-body scroll">
                {loading ? (
                  <>
                    <Skeleton height={36} />
                    <Skeleton height={36} />
                    <Skeleton height={36} />
                    <Skeleton height={36} />
                  </>
                ) : natureCounts.length === 0 ? (
                  <div className="empty">Aucune activité récente</div>
                ) : (
                  natureCounts.map(({ nature, count }) => (
                    <RecentRow key={nature} title={`${nature} — ${count}`} />
                  ))
                )}
              </div>
            </Paper>

            {/* Alertes stock (rupture + critique) */}
            <Paper elevation={0} className="dp-card panel glass">
              <div className="panel-head">
                <div className="panel-title">Alertes stock</div>
                <div className="panel-pills">
                  <Chip
                    size="small"
                    label={`Rupture ${data.stockAlerts?.rupture?.length ?? 0}`}
                    className="pill pill-r"
                  />
                  <Chip
                    size="small"
                    label={`Critique ${data.stockAlerts?.critical?.length ?? 0}`}
                    className="pill pill-c"
                  />
                </div>
              </div>
              <Divider />
              <div className="panel-body scroll">
                {loading ? (
                  <>
                    <Skeleton height={36} />
                    <Skeleton height={36} />
                    <Skeleton height={36} />
                  </>
                ) : (
                  <>
                    {(data.stockAlerts?.rupture ?? []).map((it) => {
                      const title = `${it.name}${it.reference ? ` — ${it.reference}` : ""}`;
                      return (
                        <StockRow
                          key={`r-${it.id}`}
                          level="rupture"
                          name={title}
                          quantity={it.quantity}
                          minQty={it.minQty}
                          unit={it.unit}
                        />
                      );
                    })}

                    {(data.stockAlerts?.critical ?? []).map((it) => {
                      const title = `${it.name}${it.reference ? ` — ${it.reference}` : ""}`;
                      return (
                        <StockRow
                          key={`c-${it.id}`}
                          level="critical"
                          name={title}
                          quantity={it.quantity}
                          minQty={it.minQty}
                          unit={it.unit}
                        />
                      );
                    })}

                    {(!data.stockAlerts?.rupture?.length &&
                      !data.stockAlerts?.critical?.length) && (
                      <div className="empty ok">✅ Aucun article en alerte</div>
                    )}
                  </>
                )}
              </div>
            </Paper>
          </section>
        </div>
      </Box>
    </ThemeProvider>
  );
}
