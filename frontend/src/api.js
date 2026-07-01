/* ── API client ───────────────────────────────────────────────────────── */
import { getLS } from './utils';

// Backend base URL. Override via VITE_API_URL in a .env file at the frontend
// root (Vite only exposes env vars to client code when prefixed VITE_).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Socket.IO connects to the bare server origin, not the /api-prefixed REST
// base — derive it from API_URL so the two never drift apart. Override with
// VITE_SOCKET_URL directly if the socket server ever lives elsewhere.
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, '');

/** Builds a "?a=1&b=2" string, skipping undefined/null/''/'all'/'All' (i.e. "no filter") values. */
function toQueryString(params = {}) {
  const skip = new Set([undefined, null, '', 'all', 'All']);
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (!skip.has(v)) usp.set(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

/**
 * Low-level fetch wrapper: attaches JWT (if present), parses JSON, throws on !ok.
 * `body` may be a plain object (sent as JSON) or a FormData instance (sent as
 * multipart — used for listing image uploads), in which case we must NOT set
 * our own Content-Type so the browser can add the multipart boundary.
 */
async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  const authToken = token !== undefined ? token : getLS('ck_token', null);
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (err) {
    throw new Error('Could not reach the server. Is the backend running?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no/invalid JSON body
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  signup: (name, email, password) =>
    apiFetch('/auth/signup', { method: 'POST', body: { name, email, password }, token: null }),
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password }, token: null }),
  me: (token) => apiFetch('/auth/me', { token }),

  listings: {
    // params: { q, category, type, condition, maxPrice, sort } — all optional.
    list: (params) => apiFetch(`/listings${toQueryString(params)}`, { token: null }),
    get: (id) => apiFetch(`/listings/${id}`, { token: null }),
    byUser: (userId) => apiFetch(`/listings/user/${userId}`, { token: null }),
    create: (formData) => apiFetch('/listings', { method: 'POST', body: formData }),
    update: (id, body) => apiFetch(`/listings/${id}`, { method: 'PATCH', body }),
    updateStatus: (id, status) => apiFetch(`/listings/${id}/status`, { method: 'PATCH', body: { status } }),
    remove: (id) => apiFetch(`/listings/${id}`, { method: 'DELETE' }),
  },

  wishlist: {
    list: () => apiFetch('/wishlist'),
    add: (listingId) => apiFetch(`/wishlist/${listingId}`, { method: 'POST' }),
    remove: (listingId) => apiFetch(`/wishlist/${listingId}`, { method: 'DELETE' }),
  },

  chats: {
    list: () => apiFetch('/chats'),
    // otherUserId is optional — the backend derives it from the listing's owner if omitted.
    create: (listingId, otherUserId) =>
      apiFetch('/chats', { method: 'POST', body: { listingId, otherUserId } }),
    messages: (chatId) => apiFetch(`/chats/${chatId}/messages`),
    sendImage: (chatId, formData) => apiFetch(`/chats/${chatId}/image`, { method: 'POST', body: formData }),
  },

  reviews: {
    byUser: (userId) => apiFetch(`/reviews/user/${userId}`, { token: null }),
    create: (listingId, rating, comment) =>
      apiFetch('/reviews', { method: 'POST', body: { listingId, rating, comment } }),
    remove: (id) => apiFetch(`/reviews/${id}`, { method: 'DELETE' }),
  },

  reports: {
    // Exactly one of listingId/userId should be set.
    create: (reason, { listingId, userId } = {}) =>
      apiFetch('/reports', { method: 'POST', body: { reason, listingId, userId } }),
  },

  admin: {
    stats: () => apiFetch('/admin/stats'),
    users: (params) => apiFetch(`/admin/users${toQueryString(params)}`),
    banUser: (id, blocked) => apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH', body: { blocked } }),
    listings: (params) => apiFetch(`/admin/listings${toQueryString(params)}`),
    removeListing: (id) => apiFetch(`/admin/listings/${id}/remove`, { method: 'PATCH' }),
    resolveFlag: (id) => apiFetch(`/admin/listings/${id}/resolve-flag`, { method: 'PATCH' }),
    reports: () => apiFetch('/admin/reports'),
    resolveReport: (id) => apiFetch(`/admin/reports/${id}/resolve`, { method: 'PATCH' }),
  },

  bookings: {
    byListing: (listingId) => apiFetch(`/bookings/listing/${listingId}`, { token: null }),
    create: (listingId, startDate, endDate) =>
      apiFetch('/bookings', { method: 'POST', body: { listingId, startDate, endDate } }),
  },

  notifications: {
    list: () => apiFetch('/notifications'),
    markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  },
};
