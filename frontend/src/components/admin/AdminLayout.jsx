import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './admin.css';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-root">
      <Sidebar collapsed={collapsed} toggle={() => setCollapsed(c => !c)} />
      <div className="admin-main">
        <Topbar onMenu={() => setCollapsed(c => !c)} />
        <main className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} Admin Panel</span>
        </footer>
      </div>
    </div>
  );
}