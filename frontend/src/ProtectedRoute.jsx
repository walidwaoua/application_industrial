// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowed = [] }) {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const role  = localStorage.getItem('auth_role')  || sessionStorage.getItem('auth_role');

  if (!token) return <Navigate to="/login" replace />;

  if (allowed.length && !allowed.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

