import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Select } from '../components/ui/Field.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import StudentForm from '../components/students/StudentForm.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
import { DEPARTMENTS, PAGE_SIZE, YEARS } from '../utils/constants.js';

export default function Students() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | {} (new) | student
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const q = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => api.students.list({ search: q, department, year, page, limit: PAGE_SIZE }),
    [q, department, year, page]
  );

  const changeFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  async function save(values) {
    if (editing?.id) await api.students.update(editing.id, values);
    else await api.students.create(values);
    toast.success(editing?.id ? 'Student updated' : 'Student added');
    setEditing(null);
    reload();
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.students.remove(deleting.id);
      toast.success('Student deleted');
      setDeleting(null);
      // if we deleted the last row of the page, go back one page
      if (data.data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Add, edit, search and filter students."
        actions={<Button onClick={() => setEditing({})}><Plus size={16} /> Add student</Button>}
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={changeFilter(setSearch)} placeholder="Search name, email or roll no" />
          <Select className="sm:w-40" value={department} onChange={changeFilter(setDepartment)} options={DEPARTMENTS} placeholder="All departments" />
          <Select className="sm:w-32" value={year} onChange={changeFilter(setYear)} options={YEARS.map((y) => ({ value: y, label: `Year ${y}` }))} placeholder="All years" />
        </div>

        {loading && !data ? (
          <Spinner />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : data.data.length === 0 ? (
          <EmptyState title="No students found" hint="Try changing the search or filters." />
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Name</th>
                    <th className="th">Roll no</th>
                    <th className="th">Department</th>
                    <th className="th">Year</th>
                    <th className="th hidden md:table-cell">Email</th>
                    <th className="th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="td font-semibold">{s.name}</td>
                      <td className="td text-slate-500">{s.roll_no}</td>
                      <td className="td"><Badge tone="indigo">{s.department}</Badge></td>
                      <td className="td">Year {s.year}</td>
                      <td className="td hidden text-slate-500 md:table-cell">{s.email}</td>
                      <td className="td">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(s)} aria-label="Edit"><Pencil size={15} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} aria-label="Delete"><Trash2 size={15} className="text-rose-500" /></Button>
                        </div>
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

      <Modal open={!!editing} title={editing?.id ? 'Edit student' : 'Add student'} onClose={() => setEditing(null)}>
        {editing && <StudentForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        message={`Delete ${deleting?.name}? Their registrations and attendance will be removed too.`}
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
