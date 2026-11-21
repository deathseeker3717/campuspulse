import { Menu, LogOut, Shield, Users } from 'lucide-react';
import { isMock } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/Toast.jsx';

export default function Topbar({ onMenu }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Error signing out');
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      {/* API mode badge */}
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isMock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}
        title={isMock ? 'Using built-in dummy data' : 'Connected to Express + PostgreSQL backend'}
      >
        {isMock ? 'Demo data' : 'Live API'}
      </span>

      {/* Role and User indicator */}
      {user && (
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <span
            className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
              isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isAdmin ? <Shield size={12} /> : <Users size={12} />}
            {user.role}
          </span>

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
              isAdmin ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
            }`}
            title={`${user.name} (${user.email})`}
          >
            {initial}
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}
