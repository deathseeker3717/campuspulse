import { Menu } from 'lucide-react';
import { isMock } from '../../services/api.js';

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isMock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}
        title={isMock ? 'Using built-in dummy data' : 'Connected to the Express API'}
      >
        {isMock ? 'Demo data' : 'Live API'}
      </span>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">A</div>
    </header>
  );
}
