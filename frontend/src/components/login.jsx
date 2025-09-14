import React, { useState, useEffect } from 'react';
import './login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import Axios

//  configurer axios avec l'utilisateur courant
function applyAxiosAuthFromStorage() {
  const ls = localStorage.getItem('auth_user');
  const ss = sessionStorage.getItem('auth_user');
  const user = ls ? JSON.parse(ls) : (ss ? JSON.parse(ss) : null);
  axios.defaults.baseURL = 'http://localhost:8000/api';
  if (user?.id) {
    axios.defaults.headers.common['Authorization'] = `Session ${user.id}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Fonction d'authentification avec le backend
async function authenticate({ username, password }) {
  try {
    const response = await axios.post('http://localhost:8000/api/login/', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Nom d’utilisateur ou mot de passe invalide');
    }
    throw new Error('Une erreur est survenue lors de la connexion');
  }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Si déjà authentifié, ne pas rester sur /login
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      applyAxiosAuthFromStorage();
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    // Sinon, juste configurer axios de base
    applyAxiosAuthFromStorage();
  }, [navigate]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Validation des champs
  const usernamePattern = /.*/; // Accepte tout pour le nom d'utilisateur
  const usernameError = touched.username && !usernamePattern.test(username)
    ? '' // Pas de message d'erreur
    : '';

  const passwordError = touched.password && password.length < 6
    ? 'Mot de passe : minimum 6 caractères'
    : '';

  const formInvalid = !!usernameError || !!passwordError || !username || !password;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (formInvalid) return;
    setLoading(true);
    setFormError('');
    try {
      const result = await authenticate({ username, password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('auth_token', result.token);
      storage.setItem('auth_user', JSON.stringify(result.user));
      storage.setItem('auth_role', result.role);

      // Configure axios pour TOUTES les futures requêtes
      applyAxiosAuthFromStorage();

      // Petit écran de chargement avant redirection vers le dashboard  loading
      setRedirecting(true);
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1400);
    } catch (err) {
      setFormError(err.message || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`login-page ${mounted ? 'is-mounted' : ''}`}>
      {redirecting && (
        <div className="redirect-overlay" role="status" aria-live="polite">
          <div className="redirect-box">
            <div className="big-spinner" />
            <div className="redirect-text">Connexion réussie — redirection…</div>
            <div className="redirect-progress"><span /></div>
          </div>
        </div>
      )}
      <div className="bg-orb orb-1" aria-hidden="true"></div>
      <div className="bg-orb orb-2" aria-hidden="true"></div>
      <div className="bg-grid" aria-hidden="true"></div>

      <div className={`login-card ${mounted ? 'appear' : ''}`}>
        <div className="login-side login-side--branding">
          <div className="login-brand-inner">
            <img
              src="/lafarge-placo-logo.png"
              alt="Logo Lafarge Placo"
              className={`login-logo fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '0ms' }}
              loading="eager"
            />
            <h1
              className={`brand-title fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '80ms' }}
            >
              Bienvenue
            </h1>
            <p
              className={`brand-sub fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '140ms' }}
            >
              Connectez-vous pour accéder au portail industriel Lafarge Placo.
            </p>
            <ul className="brand-benefits">
              {['Surveillance temps réel', 'Analyse opérationnelle', 'Sécurité des accès']
                .map((txt, i) => (
                  <li
                    key={txt}
                    className={`fade-item ${mounted ? 'in' : ''}`}
                    style={{ '--delay': `${220 + i * 70}ms` }}
                  >
                    {txt}
                  </li>
                ))}
            </ul>
            <footer
              className={`brand-footer fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '450ms' }}
            >
              &copy; {new Date().getFullYear()} Lafarge Placo
            </footer>
          </div>
        </div>

        <div className="login-side login-side--form">
          <div className="form-wrapper">
            <h2
              className={`form-title fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '80ms' }}
            >
              Connexion
            </h2>
            <p
              className={`form-intro fade-item ${mounted ? 'in' : ''}`}
              style={{ '--delay': '140ms' }}
            >
              Entrez votre nom d’utilisateur et votre mot de passe.
            </p>

            {formError && (
              <div
                className="alert fade-item in"
                style={{ '--delay': '160ms' }}
                role="alert"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`form-group fade-item ${mounted ? 'in' : ''} ${
                  usernameError ? 'has-error' : ''
                }`}
                style={{ '--delay': '180ms' }}
              >
                <label htmlFor="username">Nom d’utilisateur</label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, username: true }))}
                  placeholder="nom_utilisateur"
                  disabled={loading}
                  aria-invalid={!!usernameError}
                  aria-describedby={usernameError ? 'username-error' : undefined}
                />
                {usernameError && (
                  <div id="username-error" className="field-error">
                    {usernameError}
                  </div>
                )}
              </div>

              <div
                className={`form-group fade-item ${mounted ? 'in' : ''} ${
                  passwordError ? 'has-error' : ''
                }`}
                style={{ '--delay': '240ms' }}
              >
                <label htmlFor="password">Mot de passe</label>
                <div className={`password-wrapper ${showPwd ? 'showing' : ''}`}>
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    placeholder="Votre mot de passe"
                    disabled={loading}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    disabled={loading}
                  >
                    <span className="icon-wrapper" data-visible={showPwd ? 'off' : 'on'}>
                      <svg
                        className="icon-eye eye-open"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <svg
                        className="icon-eye eye-closed"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.81 21.81 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.7 3.95M1 1l22 22" />
                      </svg>
                    </span>
                  </button>
                </div>
                {passwordError && (
                  <div id="password-error" className="field-error">
                    {passwordError}
                  </div>
                )}
              </div>

              <div
                className={`form-row between fade-item ${mounted ? 'in' : ''}`}
                style={{ '--delay': '300ms' }}
              >
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(r => !r)}
                    disabled={loading}
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-button link-small"
                  onClick={() => alert('Implémenter la réinitialisation du mot de passe')}
                  disabled={loading}
                >
                  
                </button>
              </div>

              <div
                className={`fade-item ${mounted ? 'in' : ''}`}
                style={{ '--delay': '360ms' }}
              >
                <button
                  type="submit"
                  className="primary-btn pulse-on-idle"
                  disabled={loading || formInvalid}
                >
                  {loading ? (
                    <span className="spinner" aria-label="Chargement"></span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </form>

           
          </div>
        </div>
      </div>
    </div>
  );
}
