import { useState } from 'react';
import { Check, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Field.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { formatDate, pct } from '../utils/format.js';

export default function Attendance() {
  const toast = useToast();
  const [eventId, setEventId] = useState('');

  const { data: events } = useFetch(async () => (await api.events.list({ limit: 1000 })).data, []);
  const { data: rows, loading, error, reload, setData } = useFetch(
    () => (eventId ? api.attendance.listForEvent(eventId) : Promise.resolve([])),
    [eventId]
  );

  const list = rows || [];
  const present = list.filter((r) => r.attendance_status === 'present').length;
  const absent = list.filter((r) => r.attendance_status === 'absent').length;
  const selected = (events || []).find((e) => String(e.id) === String(eventId));

  // optimistic update: change the row immediately, roll back if the request fails
  async function mark(row, status) {
    const previous = list;
    setData(list.map((r) => (r.id === row.id ? { ...r, attendance_status: status } : r)));
    try {
      await api.attendance.mark({ registration_id: row.id, status });
    } catch (err) {
      setData(previous);
      toast.error(err.message);
    }
  }

  async function markAll(status) {
    try {
      await api.attendance.markAll({ event_id: Number(eventId), status });
      toast.success(`Everyone marked ${status}`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <PageHeader title="Attendance" subtitle="Pick an event and mark who showed up." />

      <div className="card mb-6 p-4">
        <Select
          className="sm:max-w-md"
          value={eventId}
          onChange={setEventId}
          placeholder="Select an event..."
          options={(events || []).map((e) => ({ value: e.id, label: `${e.title} - ${formatDate(e.event_date)}` }))}
        />
      </div>

      {!eventId ? (
        <div className="card"><EmptyState title="No event selected" hint="Choose an event above to see its attendance sheet." /></div>
      ) : loading && !rows ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <div className="card"><EmptyState title="Nobody registered for this event" /></div>
      ) : (
        <div className="card">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">{selected?.title}</p>
              <p className="text-sm text-slate-500">
                {present} present &middot; {absent} absent &middot; {list.length - present - absent} not marked &middot;{' '}
                <b className="text-slate-700">{pct(present, list.length)}% attendance</b>
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => markAll('present')}>Mark all present</Button>
              <Button size="sm" variant="secondary" onClick={() => markAll('absent')}>Mark all absent</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Student</th>
                  <th className="th">Roll no</th>
                  <th className="th">Department</th>
                  <th className="th text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="td font-semibold">{r.student_name}</td>
                    <td className="td text-slate-500">{r.roll_no}</td>
                    <td className="td">{r.department}</td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => mark(r, 'present')}
                          className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            r.attendance_status === 'present'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 text-slate-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Check size={14} /> Present
                        </button>
                        <button
                          onClick={() => mark(r, 'absent')}
                          className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            r.attendance_status === 'absent'
                              ? 'border-rose-600 bg-rose-600 text-white'
                              : 'border-slate-300 text-slate-600 hover:bg-rose-50'
                          }`}
                        >
                          <X size={14} /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
