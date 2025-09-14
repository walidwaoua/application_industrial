import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip as MUITooltip,
  Stack,
  Chip,
  Skeleton,
  Divider,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TimelineIcon from "@mui/icons-material/Timeline";
import axios from "axios";
import Header from "./Header";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import "./analyse.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Analyse() {
  const [timeframe, setTimeframe] = useState("week");
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);
  const [series, setSeries] = useState([]);

  const fetchData = async (tf = timeframe) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:8000/api/anomalies/?timeframe=${tf}`);
      const lab = Array.isArray(data?.labels) ? data.labels : [];
      const dat = Array.isArray(data?.data) ? data.data : [];
      setLabels(lab);
      setSeries(dat);
    } catch {
      setLabels([]);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(timeframe); }, [timeframe]);

  const total = useMemo(() => series.reduce((a, b) => a + (Number(b) || 0), 0), [series]);
  const maxVal = useMemo(() => (series.length ? Math.max(...series) : 0), [series]);
  const delta = useMemo(() => {
    if (series.length < 2) return 0;
    const prev = Number(series[series.length - 2]) || 0;
    const last = Number(series[series.length - 1]) || 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [series]);

  // --- DATASET avec gradient sécurisé ---
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Anomalies",
        data: series,
        tension: 0.35,
        borderColor: "#2e7d32",
        borderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: "#2e7d32",
        fill: true,
        // IMPORTANT: utiliser 'context.chart' et vérifier chartArea
        backgroundColor: (context) => {
          const chart = context.chart;
          if (!chart) return "rgba(76,175,80,.15)";
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(76,175,80,.15)"; // 1er render : area pas prête
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "rgba(76,175,80,.22)");
          g.addColorStop(1, "rgba(76,175,80,0.04)");
          return g;
        },
      },
    ],
  }), [labels, series]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        ticks: { color: "rgba(0,0,0,.7)" },
        grid: { color: "rgba(46,125,50,.08)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "rgba(0,0,0,.72)" },
        grid: { color: "rgba(46,125,50,.08)" },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: "#1b5e20", font: { weight: 700 } },
      },
      tooltip: {
        backgroundColor: "rgba(33, 33, 33, .92)",
        borderColor: "rgba(76,175,80,.6)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
  }), []);

  const exportCSV = () => {
    const rows = [["Label", "Anomalies"], ...labels.map((l, i) => [l, series[i] ?? ""])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analyse_${timeframe}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className="analyse-root">
      <Header />

      <div className="ana-bg">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      <Paper elevation={0} className="ana-hero glass">
        <div className="hero-left">
          <Typography variant="h4" className="hero-title">
            <TimelineIcon className="hero-icon" /> Analyses des anomalies
          </Typography>

        </div>

        <Stack direction="row" spacing={1} alignItems="center" className="hero-actions">
          <ToggleButtonGroup
            color="success"
            value={timeframe}
            exclusive
            onChange={(_, v) => v && setTimeframe(v)}
            size="small"
            className="time-toggle"
          >
            <ToggleButton value="week">Semaine</ToggleButton>
            <ToggleButton value="month">Mois</ToggleButton>
            <ToggleButton value="year">Année</ToggleButton>
          </ToggleButtonGroup>

          <MUITooltip title="Rafraîchir">
            <IconButton onClick={() => fetchData()} className="btn-icon">
              <RefreshIcon />
            </IconButton>
          </MUITooltip>

          <MUITooltip title="Exporter en CSV">
            <IconButton onClick={exportCSV} className="btn-icon">
              <FileDownloadIcon />
            </IconButton>
          </MUITooltip>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Box className="kpi-grid">
        <Paper elevation={0} className="kpi-card glass">
          <Typography variant="overline" className="kpi-label">Total</Typography>
          <Typography variant="h4" className="kpi-value">{total}</Typography>
          <Divider className="kpi-sep" />
          <Typography variant="caption" className="kpi-foot">Période : {timeframe}</Typography>
        </Paper>

        <Paper elevation={0} className="kpi-card glass">
          <Typography variant="overline" className="kpi-label">Max / point</Typography>
          <Typography variant="h4" className="kpi-value">{maxVal}</Typography>
          <Divider className="kpi-sep" />
          <Typography variant="caption" className="kpi-foot">Pic d’anomalies</Typography>
        </Paper>

        <Paper elevation={0} className="kpi-card glass">
          <Typography variant="overline" className="kpi-label">Tendance</Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h4" className="kpi-value">
              {delta > 0 ? `+${delta}` : delta}%
            </Typography>
            <Chip
              label={delta > 0 ? "Hausse" : delta < 0 ? "Baisse" : "Stable"}
              color={delta > 0 ? "warning" : delta < 0 ? "success" : "default"}
              size="small"
              className="kpi-chip"
            />
          </Stack>
          <Divider className="kpi-sep" />
          <Typography variant="caption" className="kpi-foot">vs. point précédent</Typography>
        </Paper>
      </Box>

      {/* GRAPHE */}
      <Paper elevation={0} className="chart-card glass hover-float">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" className="chart-title">Évolution des anomalies</Typography>
          <Button size="small" className="mini-legend">
            <span className="dot" /> Anomalies
          </Button>
        </Stack>

        <div className="chart-wrap">
          {loading ? (
            <div className="chart-skeleton">
              <Skeleton variant="rounded" height="100%" />
            </div>
          ) : (
            // datasetIdKey + key pour éviter “Canvas already in use” en dev/StrictMode
            <Line
              data={chartData}
              options={options}
              datasetIdKey="anomalies"
              key={`${timeframe}-${labels.length}`}
            />
          )}
        </div>
      </Paper>
    </Box>
  );
}
