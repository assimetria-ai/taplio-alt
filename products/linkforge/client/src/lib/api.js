const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Links
  getLinks: () => request('/links'),
  createLink: (data) => request('/links', { method: 'POST', body: JSON.stringify(data) }),
  updateLink: (id, data) => request(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLink: (id) => request(`/links/${id}`, { method: 'DELETE' }),
  getLinkAnalytics: (id) => request(`/links/${id}/analytics`),

  // Domains
  getDomains: () => request('/domains'),
  addDomain: (data) => request('/domains', { method: 'POST', body: JSON.stringify(data) }),
  verifyDomain: (id) => request(`/domains/${id}/verify`, { method: 'POST' }),
  deleteDomain: (id) => request(`/domains/${id}`, { method: 'DELETE' }),

  // QR Codes
  getQRCode: (linkId) => request(`/qrcode/${linkId}`),

  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};
