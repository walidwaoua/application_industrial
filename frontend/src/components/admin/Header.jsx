import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Stack,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
  Avatar, Tooltip, Menu, MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { Link } from 'react-router-dom';
import "./header.css";

const BASE_NAV_ITEMS = [
  { label: "Tableau de bord", href: "/admin/dashboard" },
  { label: "Formulaire", href: "/form" },
  { label: "Analyses", href: "/admin/analyse" },
  { label: "Stock", href: "/stock" },
  { label: "Ateliers", href: "/ateliers" },
  { label: "Utilisateurs", href: "/admin/users" },
  { label: "Liste des formulaires", href: "/form-list" },
  { label: "Ajouter utilisateur", href: "/admin/add-user" },
  

];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuEl, setUserMenuEl] = useState(null);

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const role =
    (typeof window !== "undefined" && (localStorage.getItem('auth_role') || sessionStorage.getItem('auth_role'))) || '';

  // Récupère le prénom (ou un nom affichable) depuis auth_user.full_name
  let displayName = role === 'admin' ? 'Administrateur' : 'Technicien';
  try {
    const us = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (us) {
      const u = JSON.parse(us);
      const name = (u?.full_name || u?.username || '').toString().trim();
      if (name) {
        const parts = name.split(/\s+/);
        // Par défaut, on prend le dernier mot comme prénom (ex: "Nom Prenom" -> Prenom)
        displayName = parts[parts.length - 1];
      }
    }
  } catch {}
  const avatarLetter = (displayName && displayName[0] ? displayName[0].toUpperCase() : (role === 'admin' ? 'A' : 'T'));

  // Filtrer la nav pour les techniciens: masquer "Utilisateurs" et "Ajouter utilisateur"
  const NAV_ITEMS = BASE_NAV_ITEMS.filter(item => {
    if (role !== 'admin' && (item.href === '/admin/users' || item.href === '/admin/add-user')) return false;
    return true;
  });

  const active = NAV_ITEMS.find((n) => pathname === n.href)?.href || "";
  const go = (href) => (window.location.href = href);

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"                 // ← empêche le bleu MUI
        elevation={8}
        className="animated-navbar"        // ← style vert unique
      >
        <Toolbar className="navbar-inner">
          {/* Left: brand + mobile menu */}
          <Box className="brand-wrap">
            <IconButton
              className="menu-trigger"
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              aria-label="ouvrir le menu"
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="a" href="/" className="brand">
              {role === 'admin' ? 'Admin Dashboard' : 'Espace Technicien'}
            </Typography>
          </Box>

          {/* Center: links (desktop) */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                onClick={() => go(item.href)}
                className={`nav-link ${active === item.href ? "active" : ""}`}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Right: user */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={displayName}>
              <Avatar className="avatar">{avatarLetter}</Avatar>
            </Tooltip>
            <Button
              color="inherit"
              endIcon={<KeyboardArrowDown />}
              onClick={(e) => setUserMenuEl(e.currentTarget)}
              className="user-btn"
            >
              {displayName}
            </Button>
            <Menu
              anchorEl={userMenuEl}
              open={Boolean(userMenuEl)}
              onClose={() => setUserMenuEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => { setUserMenuEl(null); go("/profile"); }}>Profil</MenuItem>
              <MenuItem onClick={() => { setUserMenuEl(null); go("/settings"); }}>Paramètres</MenuItem>
              <Divider />
              <MenuItem onClick={() => { setUserMenuEl(null); go("/logout"); }}>Déconnexion</MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
        <div className="sheen" />
      </AppBar>

      {/* Drawer (mobile) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ className: "drawer-paper" }}
      >
        <Box role="presentation" sx={{ width: 280 }}>
          <Box className="drawer-header">
            <Avatar className="avatar">{avatarLetter}</Avatar>
            <Box>
              <Typography variant="subtitle1" className="user-name">{displayName}</Typography>
              <Typography variant="caption" className="user-role">{role === 'admin' ? 'Administrateur' : 'Technicien'}</Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  selected={active === item.href}
                  onClick={() => { setDrawerOpen(false); go(item.href); }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <div style={{ height: 72 }} />
    </>
  );
}
