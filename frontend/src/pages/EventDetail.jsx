import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Trash2, UserPlus, Users } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge, { categoryTone } from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Select } from '../components/ui/Field.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { formatDate, pct } from '../utils/format.js';

export default function EventDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: ev, loading, error, reload } = useFetch(() => api.events.get(id), [id]);
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function openRegister() {
    setOpen(true);
    setStudentId('');
    setFormError('');
    if (students.length === 0) {
      const res = await api.students.list({ limit: 1000 });
      setStudents(res.data);
    }
  }

  async function register() {
    if (!studentId) return setFormError('Choose a student');
    setSaving(true);
    setFormError('');
    try {
      await api.registrations.create({ student_id: Number(studentId), event_id: Number(id) });
      toast.success('Student registered');
      setOpen(false);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function unregister(reg) {
    try {
      await api.registrations.remove(reg.id);
      toast.success('Registration removed');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading && !ev) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const registrations = ev.registrations || [];
  const registeredIds = new Set(registrations.map((r) => r.student_id));
  const available = students.filter((s) => !registeredIds.has(s.id));
  const full = ev.registered >= ev.capacity;

  return (
    <>
      <Link to="/events" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> All events
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone={categoryTone(ev.category)}>{ev.category}</Badge>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{ev.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{ev.description}</p>
          </div>
          <Button onClick={openRegister} disabled={full}>
            <UserPlus size={16} /> {full ? 'Event full' : 'Register student'}
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(ev.event_date)}</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> {ev.venue}</span>
          <span className="flex items-center gap-2"><Users size={16} /> {ev.registered} / {ev.capacity} ({pct(ev.registered, ev.capacity)}% full)</span>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="border-b border-slate-200 px-5 py-4 font-bold">Registered students ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <EmptyState title="No registrations yet" hint="Register the first student for this event." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Roll no</th>
                  <th className="th">Department</th>
                  <th className="th">Attendance</th>
                  <th className="th text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="td font-semibold">{r.student_name}</td>
                    <td className="td text-slate-500">{r.roll_no}</td>
                    <td className="td">{r.department}</td>
                    <td className="td">
                      {r.attendance_status ? (
                        <Badge tone={r.attendance_status === 'present' ? 'green' : 'red'}>{r.attendance_status}</Badge>
                      ) : (
                        <span className="text-slate-400">Not marked</span>
                      )}
                    </td>
                    <td className="td text-right">
                      <Button variant="ghost" size="sm" onClick={() => unregister(r)} aria-label="Remove registration">
                        <Trash2 size={15} className="text-rose-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} title="Register a student" onClose={() => setOpen(false)} width="max-w-md">
        <Field label="Student" error={formError}>
          <Select
            value={studentId}
            onChange={setStudentId}
            placeholder="Select a student..."
            options={available.map((s) => ({ value: s.id, label: `${s.name} (${s.roll_no})` }))}
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={register} loading={saving}>Register</Button>
        </div>
      </Modal>
    </>
  );
}
