// Dummy data used while the backend is not ready (VITE_USE_MOCK=true).
// Field names mirror the PostgreSQL tables so switching to the real API is painless.
import { DEPARTMENTS, EVENT_CATEGORIES } from '../utils/constants.js';

// tiny deterministic random generator so the data is the same on every reload
let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Ananya', 'Diya', 'Ishaan', 'Kavya', 'Rohan', 'Saanvi', 'Arjun',
  'Meera', 'Kabir', 'Riya', 'Yash', 'Tanya', 'Dev', 'Nisha', 'Karan', 'Pooja', 'Manav'];
const LAST = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Goyal', 'Kumar', 'Mehta', 'Jain', 'Yadav', 'Reddy'];

export const students = Array.from({ length: 40 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[Math.floor(i / 4) % LAST.length];
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first}.${last}${i + 1}@campus.edu`.toLowerCase(),
    roll_no: `CP26${String(i + 1).padStart(3, '0')}`,
    department: pick(DEPARTMENTS),
    year: 1 + Math.floor(rand() * 4),
    phone: `98${String(Math.floor(rand() * 1e8)).padStart(8, '0')}`,
  };
});

const EVENT_SEED = [
  ['HackSprint 2026', 'Technical', 'Main Auditorium', '2026-08-22', 120],
  ['Freshers Fiesta', 'Cultural', 'Open Air Theatre', '2026-09-05', 200],
  ['Inter-Dept Cricket', 'Sports', 'Central Ground', '2026-09-19', 60],
  ['Data Engineering Workshop', 'Workshop', 'Lab 3', '2026-10-03', 40],
  ['AI & Ethics Seminar', 'Seminar', 'Seminar Hall A', '2026-10-17', 80],
  ['Robo Race', 'Technical', 'Mech Workshop', '2026-10-30', 50],
  ['Diwali Cultural Night', 'Cultural', 'Open Air Theatre', '2026-11-08', 180],
  ['Cloud Computing Bootcamp', 'Workshop', 'Lab 1', '2026-11-28', 45],
  ['Annual Sports Meet', 'Sports', 'Central Ground', '2026-12-10', 150],
  ['Placement Prep Seminar', 'Seminar', 'Seminar Hall B', '2026-12-18', 100],
];

export const events = EVENT_SEED.map(([title, category, venue, event_date, capacity], i) => ({
  id: i + 1,
  title,
  description: `${title} brings students together for a day of learning, competition and fun. Open to all departments.`,
  category,
  venue,
  event_date,
  capacity,
}));

export const registrations = [];
let regId = 1;
events.forEach((ev) => {
  const count = 8 + Math.floor(rand() * 24);
  const chosen = new Set();
  while (chosen.size < count) chosen.add(1 + Math.floor(rand() * students.length));
  chosen.forEach((studentId) => {
    registrations.push({
      id: regId++,
      student_id: studentId,
      event_id: ev.id,
      registered_at: `${ev.event_date.slice(0, 8)}01`,
    });
  });
});

// attendance only exists for events that already happened
export const attendance = [];
let attId = 1;
registrations.forEach((r) => {
  const ev = events.find((e) => e.id === r.event_id);
  if (new Date(ev.event_date) < new Date('2026-11-14')) {
    attendance.push({ id: attId++, registration_id: r.id, status: rand() < 0.78 ? 'present' : 'absent' });
  }
});
