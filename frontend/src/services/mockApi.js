// In-memory implementation of the same interface as the real API (see api.js).
// Data resets on page refresh - that is intentional for a demo.
import * as seedData from './mockData.js';

const db = {
  students: [...seedData.students],
  events: [...seedData.events],
  registrations: [...seedData.registrations],
  attendance: [...seedData.attendance],
};
let nextId = { students: 1000, events: 1000, registrations: 5000, attendance: 9000 };

const delay = (v, ms = 250) => new Promise((res) => setTimeout(() => res(v), ms));
const fail = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return Promise.reject(err);
};

function paginate(rows, { page = 1, limit = 8 } = {}) {
  const p = Number(page) || 1;
  const l = Number(limit) || 8;
  return { data: rows.slice((p - 1) * l, p * l), total: rows.length, page: p, limit: l };
}

const studentOf = (id) => db.students.find((s) => s.id === Number(id));
const eventOf = (id) => db.events.find((e) => e.id === Number(id));

// JOIN registrations with students + events (what the backend would do in SQL)
function joinRegistration(r) {
  const s = studentOf(r.student_id);
  const e = eventOf(r.event_id);
  const a = db.attendance.find((x) => x.registration_id === r.id);
  return {
    ...r,
    student_name: s?.name,
    roll_no: s?.roll_no,
    department: s?.department,
    event_title: e?.title,
    event_date: e?.event_date,
    attendance_status: a?.status ?? null,
  };
}

const includes = (text, q) => String(text ?? '').toLowerCase().includes(String(q).toLowerCase());

export const mockApi = {
  students: {
    list({ search, department, year, page, limit } = {}) {
      let rows = db.students;
      if (search) rows = rows.filter((s) => includes(s.name, search) || includes(s.email, search) || includes(s.roll_no, search));
      if (department) rows = rows.filter((s) => s.department === department);
      if (year) rows = rows.filter((s) => s.year === Number(year));
      return delay(paginate(rows, { page, limit }));
    },
    create(body) {
      if (db.students.some((s) => s.email === body.email)) return fail('A student with this email already exists', 409);
      const row = { ...body, id: nextId.students++, year: Number(body.year) };
      db.students.unshift(row);
      return delay(row);
    },
    update(id, body) {
      const i = db.students.findIndex((s) => s.id === Number(id));
      if (i < 0) return fail('Student not found', 404);
      db.students[i] = { ...db.students[i], ...body, year: Number(body.year) };
      return delay(db.students[i]);
    },
    remove(id) {
      db.students = db.students.filter((s) => s.id !== Number(id));
      const regIds = db.registrations.filter((r) => r.student_id === Number(id)).map((r) => r.id);
      db.registrations = db.registrations.filter((r) => r.student_id !== Number(id));
      db.attendance = db.attendance.filter((a) => !regIds.includes(a.registration_id));
      return delay({ success: true });
    },
  },

  events: {
    list({ search, category, page, limit } = {}) {
      let rows = [...db.events].sort((a, b) => a.event_date.localeCompare(b.event_date));
      if (search) rows = rows.filter((e) => includes(e.title, search) || includes(e.venue, search));
      if (category) rows = rows.filter((e) => e.category === category);
      rows = rows.map((e) => ({ ...e, registered: db.registrations.filter((r) => r.event_id === e.id).length }));
      return delay(paginate(rows, { page, limit: limit || 6 }));
    },
    get(id) {
      const e = eventOf(id);
      if (!e) return fail('Event not found', 404);
      const regs = db.registrations.filter((r) => r.event_id === e.id).map(joinRegistration);
      return delay({ ...e, registered: regs.length, registrations: regs });
    },
    create(body) {
      const row = { ...body, id: nextId.events++, capacity: Number(body.capacity) };
      db.events.push(row);
      return delay(row);
    },
    update(id, body) {
      const i = db.events.findIndex((e) => e.id === Number(id));
      if (i < 0) return fail('Event not found', 404);
      db.events[i] = { ...db.events[i], ...body, capacity: Number(body.capacity) };
      return delay(db.events[i]);
    },
    remove(id) {
      const regIds = db.registrations.filter((r) => r.event_id === Number(id)).map((r) => r.id);
      db.events = db.events.filter((e) => e.id !== Number(id));
      db.registrations = db.registrations.filter((r) => r.event_id !== Number(id));
      db.attendance = db.attendance.filter((a) => !regIds.includes(a.registration_id));
      return delay({ success: true });
    },
  },

  registrations: {
    list({ search, event_id, page, limit } = {}) {
      let rows = db.registrations.map(joinRegistration);
      if (event_id) rows = rows.filter((r) => r.event_id === Number(event_id));
      if (search) rows = rows.filter((r) => includes(r.student_name, search) || includes(r.event_title, search) || includes(r.roll_no, search));
      rows.sort((a, b) => b.id - a.id);
      return delay(paginate(rows, { page, limit }));
    },
    create({ student_id, event_id }) {
      const ev = eventOf(event_id);
      if (!ev) return fail('Event not found', 404);
      if (db.registrations.some((r) => r.student_id === Number(student_id) && r.event_id === Number(event_id))) {
        return fail('This student is already registered for the event', 409);
      }
      if (db.registrations.filter((r) => r.event_id === ev.id).length >= ev.capacity) return fail('Event is full', 409);
      const row = { id: nextId.registrations++, student_id: Number(student_id), event_id: Number(event_id), registered_at: new Date().toISOString() };
      db.registrations.push(row);
      return delay(joinRegistration(row));
    },
    remove(id) {
      db.registrations = db.registrations.filter((r) => r.id !== Number(id));
      db.attendance = db.attendance.filter((a) => a.registration_id !== Number(id));
      return delay({ success: true });
    },
  },

  attendance: {
    // all registrations of one event with their attendance status
    listForEvent(event_id) {
      const rows = db.registrations.filter((r) => r.event_id === Number(event_id)).map(joinRegistration);
      return delay(rows);
    },
    mark({ registration_id, status }) {
      const existing = db.attendance.find((a) => a.registration_id === Number(registration_id));
      if (existing) existing.status = status;
      else db.attendance.push({ id: nextId.attendance++, registration_id: Number(registration_id), status });
      return delay({ registration_id: Number(registration_id), status }, 120);
    },
    markAll({ event_id, status }) {
      db.registrations.filter((r) => r.event_id === Number(event_id)).forEach((r) => {
        const existing = db.attendance.find((a) => a.registration_id === r.id);
        if (existing) existing.status = status;
        else db.attendance.push({ id: nextId.attendance++, registration_id: r.id, status });
      });
      return delay({ success: true });
    },
  },

  analytics: {
    summary() {
      const marked = db.attendance.length;
      const present = db.attendance.filter((a) => a.status === 'present').length;
      return delay({
        total_students: db.students.length,
        total_events: db.events.length,
        total_registrations: db.registrations.length,
        avg_attendance: marked ? Math.round((present / marked) * 100) : 0,
      });
    },
    topEvents() {
      const rows = db.events
        .map((e) => ({ event_id: e.id, title: e.title, registrations: db.registrations.filter((r) => r.event_id === e.id).length }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5);
      return delay(rows);
    },
    departments() {
      const map = {};
      db.registrations.forEach((r) => {
        const d = studentOf(r.student_id)?.department;
        if (d) map[d] = (map[d] || 0) + 1;
      });
      return delay(Object.entries(map).map(([department, participation]) => ({ department, participation })).sort((a, b) => b.participation - a.participation));
    },
    attendance() {
      const rows = db.events
        .map((e) => {
          const regs = db.registrations.filter((r) => r.event_id === e.id);
          const atts = regs.map((r) => db.attendance.find((a) => a.registration_id === r.id)).filter(Boolean);
          const present = atts.filter((a) => a.status === 'present').length;
          return {
            event_id: e.id,
            title: e.title,
            registered: regs.length,
            present,
            percentage: atts.length ? Math.round((present / regs.length) * 100) : null,
          };
        })
        .filter((r) => r.percentage !== null);
      return delay(rows);
    },
    monthly() {
      const map = {};
      db.registrations.forEach((r) => {
        const ev = eventOf(r.event_id);
        const key = ev.event_date.slice(0, 7);
        map[key] = (map[key] || 0) + 1;
      });
      return delay(Object.keys(map).sort().map((month) => ({ month, registrations: map[month] })));
    },
  },
};
