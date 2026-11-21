import { useState } from 'react';
import { UserPlus, Shield, Users, CheckCircle, Info, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Field } from '../components/ui/Field.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { api } from '../services/api.js';

export default function StaffManagement() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('organizer');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdStaff, setCreatedStaff] = useState([]);

  function validate() {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length > 100) {
      errs.name = 'Name cannot exceed 100 characters';
    }

    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (trimmedEmail.length > 254) {
      errs.email = 'Email cannot exceed 254 characters';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    } else if (new TextEncoder().encode(password).length > 72) {
      errs.password = 'Password cannot exceed 72 bytes';
    }

    if (!['admin', 'organizer'].includes(role)) {
      errs.role = 'Please select a valid role (admin or organizer)';
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
      const res = await api.auth.createStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      toast.success(res?.message || `Staff account created for ${name.trim()}!`);
      if (res?.user) {
        setCreatedStaff((prev) => [res.user, ...prev]);
      }

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('organizer');
      setErrors({});
    } catch (err) {
      if (err.status === 409) {
        setServerError('This email is already registered in the system.');
      } else if (err.status === 403) {
        setServerError('Unauthorized: Only Admin accounts can create staff members.');
      } else {
        setServerError(err.message || 'Could not create staff account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Staff Management"
        subtitle="Provision administrative and event organizer accounts for CampusPulse."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Creation Form */}
        <div className="lg:col-span-7">
          <div className="card p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Create Staff Account</h2>
                <p className="text-xs text-slate-500">Provide personal credentials and assign role permissions.</p>
              </div>
            </div>

            {serverError && (
              <div className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Full Name" error={errors.name}>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    disabled={submitting}
                    className={`input pl-9 ${errors.name ? 'border-rose-400' : ''}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
              </Field>

              <Field label="Email Address" error={errors.email}>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    disabled={submitting}
                    className={`input pl-9 ${errors.email ? 'border-rose-400' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="e.g. priya.sharma@campus.edu"
                  />
                </div>
              </Field>

              <Field label="Initial Password" error={errors.password}>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={submitting}
                    className={`input pl-9 pr-10 ${errors.password ? 'border-rose-400' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <div>
                <label className="label">Assigned Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                      role === 'organizer'
                        ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-sm">
                        <Users size={16} className={role === 'organizer' ? 'text-brand-600' : 'text-slate-400'} />
                        Organizer
                      </span>
                      {role === 'organizer' && <CheckCircle size={16} className="text-brand-600" />}
                    </div>
                    <span className="mt-1 text-xs text-slate-500">
                      Manage events, registrations, attendance, and view analytics.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                      role === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-sm">
                        <Shield size={16} className={role === 'admin' ? 'text-indigo-600' : 'text-slate-400'} />
                        Admin
                      </span>
                      {role === 'admin' && <CheckCircle size={16} className="text-indigo-600" />}
                    </div>
                    <span className="mt-1 text-xs text-slate-500">
                      Complete control including student CRUD and staff onboarding.
                    </span>
                  </button>
                </div>
                {errors.role && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.role}</p>}
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" loading={submitting} className="w-full sm:w-auto">
                  <UserPlus size={16} /> Create Account
                </Button>
              </div>
            </form>
          </div>

          {/* Session Created Accounts */}
          {createdStaff.length > 0 && (
            <div className="card mt-6 p-5">
              <h3 className="text-sm font-bold text-slate-800">Accounts Created in this Session ({createdStaff.length})</h3>
              <div className="mt-3 divide-y divide-slate-100">
                {createdStaff.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Permissions & Architectural Documentation */}
        <div className="space-y-6 lg:col-span-5">
          {/* Permissions Matrix */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900">Role Permissions Matrix</h3>
            <p className="mt-1 text-xs text-slate-500">Overview of capabilities enforced across frontend and backend.</p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Capability</th>
                    <th className="px-2 py-2 text-center">Admin</th>
                    <th className="px-2 py-2 text-center">Organizer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2 font-medium">Dashboard & Analytics</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">View Students</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Create/Edit/Delete Students</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-rose-500 font-bold">✕</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Events Management</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Registrations & Attendance</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Create Staff Accounts</td>
                    <td className="px-2 py-2 text-center text-emerald-600 font-bold">✓</td>
                    <td className="px-2 py-2 text-center text-rose-500 font-bold">✕</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Architecture Report Card */}
          <div className="card p-5 border-amber-200 bg-amber-50/40">
            <div className="flex items-start gap-2.5">
              <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">API Contract Note</h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  The backend contract provides <code>POST /api/auth/users</code> for onboarding new staff credentials.
                  To support a full staff directory table, the following endpoints are recommended for future backend revisions:
                </p>
                <ul className="mt-2 list-disc pl-4 text-xs text-amber-900 space-y-1">
                  <li><code>GET /api/auth/users</code> — Retrieve all active staff</li>
                  <li><code>PUT /api/auth/users/:id</code> — Edit role or contact details</li>
                  <li><code>DELETE /api/auth/users/:id</code> — Deactivate staff accounts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
