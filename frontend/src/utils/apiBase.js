// Determine API base in a Vite-friendly way, with sensible fallbacks.
export function getApiBase() {
  // Primary env var used by current API helpers
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Preferred Vite env var
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REACT_APP_API_BASE) {
    return import.meta.env.VITE_REACT_APP_API_BASE;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // Some users export REACT_APP_API_BASE in their shell before starting dev server.
  // Vite won't expose it to import.meta.env unless prefixed with VITE_. As a convenience,
  // we also check for a global variable that can be injected in index.html (not automatic).
  if (typeof window !== 'undefined' && window.__REACT_APP_API_BASE) {
    return window.__REACT_APP_API_BASE;
  }

  // In production-like environments, prefer same-origin instead of localhost.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) {
      return window.location.origin;
    }
  }

  // Default - common local backend port used in this project
  return 'http://localhost:5000';
}

export default getApiBase;
