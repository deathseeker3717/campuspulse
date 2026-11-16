import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, CalendarDays, ClipboardList, UserCheck, BarChart3, Activity, X } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: GraduationCap },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Activity size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">CampusPulse</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-5 py-4 text-xs text-slate-400">AP + DE Capstone</p>
      </aside>
    </>
  );
}
