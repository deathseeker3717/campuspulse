import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';

export default function Login() {
  const { user, login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Destination after successful login
  const from = location.state?.from?.pathname || '/';

  // If already logged in, redirect away from login page
  if (!authLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function validate() {
    const errs = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setServerError('Invalid email or password. Please verify your credentials.');
      } else {
        setServerError(err.message || 'Cannot reach the authentication server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
            <Activity size={32} />
          </div>
        </div>
        <h1 className="mt-4 text-center text-3xl font-black tracking-tight text-slate-900">
          CampusPulse
        </h1>
        <p className="mt-1 text-center text-sm font-medium text-slate-500">
          Sign in to your administrative or event staff portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-6 sm:p-8">
          {serverError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="label">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={17} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  disabled={submitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="admin@campus.edu"
                  className={`input pl-9 ${errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={submitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`input pl-9 pr-10 ${errors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-2.5 text-sm font-bold shadow-md shadow-brand-600/20"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Access Policy:</p>
            <p className="mt-1 leading-relaxed">
              Public registration is disabled. Only existing <strong>Admin</strong> accounts and staff accounts created by an Admin can sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
