// API configuration and helper functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Generic API call helper with better header/options merging and credentials included
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    credentials: 'include', // send cookies for session-based auth
    headers: {
      'Content-Type': 'application/json'
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
  schemes: schemesAPI,
  fir: firAPI,
  alerts: alertsAPI
};
