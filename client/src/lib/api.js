const BASE = '/api';

function getToken() {
  return localStorage.getItem('ll_token');
}

export function setToken(token) {
  localStorage.setItem('ll_token', token);
}

export function clearToken() {
  localStorage.removeItem('ll_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getOverview: () => request('/stats/overview'),
  getRevenueTrend: () => request('/stats/revenue-trend'),
  getProperties: (params) => request(`/properties?${new URLSearchParams(params)}`),
  getProperty: (id) => request(`/properties/${id}`),
  getTransactions: (params) => request(`/transactions?${new URLSearchParams(params)}`),
  getTransactionSummary: () => request('/transactions/summary'),
  getMaintenanceTickets: (params) => request(`/maintenance?${new URLSearchParams(params)}`),
  getMaintenanceStats: () => request('/maintenance/stats'),
  getBrokers: () => request('/brokers'),
  getBrokerStats: () => request('/brokers/stats'),
};
