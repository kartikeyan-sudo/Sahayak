// API configuration and helper functions
import getApiBase from './apiBase';

const API_BASE_URL = getApiBase();

const getAuthToken = () => {
  const session = localStorage.getItem('sahayakSession');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

// Generic API call helper with better header/options merging and credentials included
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const defaultOptions = {
    credentials: 'include', // send cookies for session-based auth
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };

  // Merge headers explicitly so user-provided headers override defaults
  const mergedHeaders = {
    ...defaultOptions.headers,
    ...(options.headers || {})
  };

  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: mergedHeaders
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      // Try to parse JSON error body, otherwise include status
      let errorBody = { message: `HTTP ${response.status}` };
      try {
        errorBody = await response.json();
      } catch (e) {
        // ignore JSON parse errors
      }
      throw new Error(errorBody.message || `API request failed with status ${response.status}`);
    }

    // Attempt to parse JSON; if no content return null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (payload) => apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: (payload) => apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  me: () => apiCall('/api/auth/me')
};

// Public blogs API
export const blogsAPI = {
  getAll: () => apiCall('/api/blogs'),
  getBySlug: (slug) => apiCall(`/api/blogs/${slug}`)
};

// Schemes API
export const schemesAPI = {
  getAll: () => apiCall('/api/schemes'),
  getById: (id) => apiCall(`/api/schemes/${id}`),
  create: (scheme) => apiCall('/api/schemes', {
    method: 'POST',
    body: JSON.stringify(scheme)
  }),
  update: (id, scheme) => apiCall(`/api/schemes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(scheme)
  }),
  delete: (id) => apiCall(`/api/schemes/${id}`, {
    method: 'DELETE'
  })
};

// FIR Drafts API
export const firAPI = {
  getAllByUser: (userId) => apiCall(`/api/fir/user/${userId}`),
  getById: (id) => apiCall(`/api/fir/${id}`),
  create: (draft) => apiCall('/api/fir', {
    method: 'POST',
    body: JSON.stringify(draft)
  }),
  update: (id, draft) => apiCall(`/api/fir/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(draft)
  }),
  delete: (id) => apiCall(`/api/fir/${id}`, {
    method: 'DELETE'
  }),
  submit: (id) => apiCall(`/api/fir/${id}/submit`, {
    method: 'POST'
  }),
  generatePdf: (id) => apiCall(`/api/fir/${id}/pdf`, {
    method: 'POST'
  })
};

// Alerts API
export const alertsAPI = {
  getAll: () => apiCall('/api/alerts'),
  create: (alert) => apiCall('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(alert)
  }),
  update: (id, alert) => apiCall(`/api/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(alert)
  }),
  delete: (id) => apiCall(`/api/alerts/${id}`, {
    method: 'DELETE'
  })
};

export default {
  auth: authAPI,
  blogs: blogsAPI,
  schemes: schemesAPI,
  fir: firAPI,
  alerts: alertsAPI
};
