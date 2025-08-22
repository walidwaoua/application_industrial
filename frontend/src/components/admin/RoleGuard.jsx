import React from 'react';
import { Navigate } from 'react-router-dom';


/**
 * Protection par rôle :
 * <RoleGuard allow={['admin','manager']}><Users/></RoleGuard>
 * allow peut être string ou array.
 * redirect: chemin si non connecté.
 */
export default function RoleGuard({ allow, children, redirect = '/login' }) {
  const auth = useAuth();
  const user = auth?.user;
  if (!user) return <Navigate to={redirect} replace />;
  if (allow) {
    const ok = Array.isArray(allow) ? allow.includes(user.role) : user.role === allow;
    if (!ok) return <Navigate to="/admin" replace />;
  }
  return children;
}