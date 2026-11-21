import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccessDenied({ requiredRole = 'Admin' }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100">
        <ShieldAlert size={36} />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Access Denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        You are currently signed in as{' '}
        <span className="font-semibold text-slate-800 capitalize">{user?.role || 'user'}</span>.
        This page requires <span className="font-semibold text-rose-700">{requiredRole}</span> permissions.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
