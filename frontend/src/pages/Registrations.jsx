import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import { Field, Select } from '../components/ui/Field.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
import { PAGE_SIZE } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

export default function Registrations() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', event_id: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const q = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => api.registrations.list({ search: q, event_id: eventFilter, page, limit: PAGE_SIZE }),
    [q, eventFilter, page]
  );
  // options for the dropdowns (loaded once)
  const { data: lookups } = useFetch(async () => {
    const [s, e] = await Promise.all([api.students.list({ limit: 1000 }), api.events.list({ limit: 1000 })]);
    return { students: s.data, events: e.data };
  }, []);

  async function create() {
    if (!form.student_id || !form.event_id) return setFormError('Choose both a student and an event');
    setSaving(true);
    setFormError('');
    try {
      await api.registrations.create({ student_id: Number(form.student_id), event_id: Number(form.event_id) });
      toast.success('Registration created');
      setOpen(false);
      setForm({ student_id: '', event_id: '' });
      reload();
    } catch (err) {
      setFormError(err.message); // e.g. duplicate registration / event full
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await api.registrations.remove(deleting.id);
      toast.success('Registration removed');
      setDeleting(null);
      if (data.data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const eventOptions = (lookups?.events || []).map((e) => ({ value: e.id, label: e.title }));

  return (
    <>
      <PageHeader
        title="Registrations"
        subtitle="Which student is registered for which event."
        actions={<Button onClick={() => { setOpen(true); setFormError(''); }}><Plus size={16} /> New registration</Button>}
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search student, roll no or event" />
          <Select className="sm:w-64" value={eventFilter} onChange={(v) => { setEventFilter(v); setPage(1); }} options={eventOptions} placeholder="All events" />
        </div>

        {loading && !data ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState title="No registrations found" />
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Student</th>
                    <th className="th">Department</th>
                    <th className="th">Event</th>
                    <th className="th hidden sm:table-cell">Event date</th>
                    <th className="th text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="td"><span className="font-semibold">{r.student_name}</span><br /><span className="text-xs text-slate-500">{r.roll_no}</span></td>
                      <td className="td">{r.department}</td>
                      <td className="td"><Link className="font-medium hover:text-brand-600" to={`/events/${r.event_id}`}>{r.event_title}</Link></td>
                      <td className="td hidden text-slate-500 sm:table-cell">{formatDate(r.event_date)}</td>
                      <td className="td text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label="Remove registration"><Trash2 size={15} className="text-rose-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
          </>
        )}
      </div>

      <Modal open={open} title="New registration" onClose={() => setOpen(false)} width="max-w-md">
        <div className="space-y-4">
          <Field label="Student">
            <Select
              value={form.student_id}
              onChange={(v) => setForm((f) => ({ ...f, student_id: v }))}
              placeholder="Select a student..."
              options={(lookups?.students || []).map((s) => ({ value: s.id, label: `${s.name} (${s.roll_no})` }))}
            />
          </Field>
          <Field label="Event">
            <Select value={form.event_id} onChange={(v) => setForm((f) => ({ ...f, event_id: v }))} placeholder="Select an event..." options={eventOptions} />
          </Field>
          {formError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{formError}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={create} loading={saving}>Register</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        confirmText="Remove"
        message={`Remove ${deleting?.student_name} from "${deleting?.event_title}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
