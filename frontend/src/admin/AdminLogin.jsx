import React, { useState, useEffect, useRef } from 'react';
import getApiBase from '../utils/apiBase';

function AdminLogin({ onLogin, defaultCreds }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const attemptedRef = useRef(false);

  const API_BASE = getApiBase();

  useEffect(() => {
    if (defaultCreds && !attemptedRef.current) {
      setUsername(defaultCreds.username || '');
      setPassword(defaultCreds.password || '');
      attemptedRef.current = true;
      setTimeout(() => handleSubmitAuto(defaultCreds.username, defaultCreds.password), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCreds]);

  const handleSubmitAuto = async (u, p) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      if (!resp.ok) {
        const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const isProd = import.meta.env.MODE === 'production' || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
        if (isLocal && !isProd) {
          localStorage.setItem('adminToken', 'dev-local-token');
          if (onLogin) onLogin({ username: u });
          return;
        }
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.message || 'Login failed');
      }
      const data = await resp.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        if (onLogin) onLogin(data.user || { username: u });
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.message || 'Invalid credentials');
      }
      const data = await resp.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        if (onLogin) onLogin(data.user || { username });
      }
    } catch (err) {
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const isProd = import.meta.env.MODE === 'production' || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
      if (isLocal && !isProd && defaultCreds && defaultCreds.username === username && defaultCreds.password === password) {
        localStorage.setItem('adminToken', 'dev-local-token');
        if (onLogin) onLogin({ username });
        setLoading(false);
        return;
      }
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login-form">
        <h2>CMS Login</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Tip: For local testing, use <strong>admin</strong> / <strong>admin</strong> or create an admin via the backend register endpoint.
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
