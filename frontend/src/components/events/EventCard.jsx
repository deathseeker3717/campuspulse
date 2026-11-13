import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Pencil, Trash2, Users } from 'lucide-react';
import Badge, { categoryTone } from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { formatDate, pct } from '../../utils/format.js';

export default function EventCard({ event, onEdit, onDelete }) {
  const filled = pct(event.registered, event.capacity);
  return (
    <div className="card flex flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge tone={categoryTone(event.category)}>{event.category}</Badge>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(event)} aria-label="Edit event"><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(event)} aria-label="Delete event"><Trash2 size={14} className="text-rose-500" /></Button>
        </div>
      </div>
      <Link to={`/events/${event.id}`} className="text-lg font-bold leading-snug text-slate-900 hover:text-brand-600">
        {event.title}
      </Link>
      <div className="mt-3 space-y-1.5 text-sm text-slate-500">
        <p className="flex items-center gap-2"><CalendarDays size={15} /> {formatDate(event.event_date)}</p>
        <p className="flex items-center gap-2"><MapPin size={15} /> {event.venue}</p>
        <p className="flex items-center gap-2"><Users size={15} /> {event.registered ?? 0} / {event.capacity} registered</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${filled >= 90 ? 'bg-rose-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(filled, 100)}%` }} />
      </div>
      <Link to={`/events/${event.id}`} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
        View details &rarr;
      </Link>
    </div>
  );
}
