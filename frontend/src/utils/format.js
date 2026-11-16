export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// "2026-11-14T10:00:00Z" -> "2026-11-14" (value for <input type="date">)
export function toInputDate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function isPast(value) {
  return new Date(value).getTime() < Date.now();
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function monthLabel(yyyyMm) {
  const [y, m] = String(yyyyMm).split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}
