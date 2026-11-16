// Single entry point for all backend calls.
//
// Pages only ever import `api` from here. With VITE_USE_MOCK=true they get the
// in-memory dummy data; with VITE_USE_MOCK=false the same calls hit the Express API.
//
// Expected Express routes (agree on these with Aditya - see docs/API.md):
//   GET    /students?search=&department=&year=&page=&limit=   -> { data, total, page, limit }
//   POST   /students            PUT /students/:id            DELETE /students/:id
//   GET    /events?search=&category=&page=&limit=             -> { data, total, page, limit }
//   GET    /events/:id          (with registrations[])
//   POST   /events              PUT /events/:id              DELETE /events/:id
//   GET    /registrations?search=&event_id=&page=&limit=      -> { data, total, page, limit }
//   POST   /registrations {student_id, event_id}             DELETE /registrations/:id
//   GET    /attendance?event_id=                              -> [registration rows with attendance_status]
//   POST   /attendance {registration_id, status}              POST /attendance/bulk {event_id, status}
//   GET    /analytics/summary | top-events | departments | attendance | monthly
import { mockApi } from './mockApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function http(path, { method = 'GET', body, params } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}${qs(params)}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body (e.g. 204) */
  }
  if (!res.ok) {
    const err = new Error(payload?.message || payload?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return payload;
}

// Accept either { data, total } or a plain array from the backend.
function asPage(payload, params = {}) {
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length, page: Number(params.page) || 1, limit: Number(params.limit) || payload.length };
  }
  return payload;
}
// Accept either { data: ... } or the raw value.
const unwrap = (p) => (p && !Array.isArray(p) && p.data !== undefined && p.total === undefined ? p.data : p);

const realApi = {
  students: {
    list: async (p) => asPage(await http('/students', { params: p }), p),
    create: (body) => http('/students', { method: 'POST', body }).then(unwrap),
    update: (id, body) => http(`/students/${id}`, { method: 'PUT', body }).then(unwrap),
    remove: (id) => http(`/students/${id}`, { method: 'DELETE' }),
  },
  events: {
    list: async (p) => asPage(await http('/events', { params: p }), p),
    get: (id) => http(`/events/${id}`).then(unwrap),
    create: (body) => http('/events', { method: 'POST', body }).then(unwrap),
    update: (id, body) => http(`/events/${id}`, { method: 'PUT', body }).then(unwrap),
    remove: (id) => http(`/events/${id}`, { method: 'DELETE' }),
  },
  registrations: {
    list: async (p) => asPage(await http('/registrations', { params: p }), p),
    create: (body) => http('/registrations', { method: 'POST', body }).then(unwrap),
    remove: (id) => http(`/registrations/${id}`, { method: 'DELETE' }),
  },
  attendance: {
    listForEvent: (event_id) => http('/attendance', { params: { event_id } }).then(unwrap),
    mark: (body) => http('/attendance', { method: 'POST', body }),
    markAll: (body) => http('/attendance/bulk', { method: 'POST', body }),
  },
  analytics: {
    summary: () => http('/analytics/summary').then(unwrap),
    topEvents: () => http('/analytics/top-events').then(unwrap),
    departments: () => http('/analytics/departments').then(unwrap),
    attendance: () => http('/analytics/attendance').then(unwrap),
    monthly: () => http('/analytics/monthly').then(unwrap),
  },
};

export const api = USE_MOCK ? mockApi : realApi;
export const isMock = USE_MOCK;
