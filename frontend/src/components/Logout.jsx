import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Clear both persistent and session auth
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_role');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_role');

      // Remove axios Authorization header
      if (axios.defaults.headers.common && axios.defaults.headers.common['Authorization']) {
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null;
}

