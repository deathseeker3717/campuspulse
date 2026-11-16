import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import { Select } from '../components/ui/Field.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import EventCard from '../components/events/EventCard.jsx';
import EventForm from '../components/events/EventForm.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import { api } from '../services/api.js';
import { EVENT_CATEGORIES } from '../utils/constants.js';

const LIMIT = 6;

export default function Events() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const q = useDebounce(search);
  const { data, loading, error, reload } = useFetch(
    () => api.events.list({ search: q, category, page, limit: LIMIT }),
    [q, category, page]
  );

  const changeFilter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  async function save(values) {
    if (editing?.id) await api.events.update(editing.id, values);
    else await api.events.create(values);
    toast.success(editing?.id ? 'Event updated' : 'Event created');
    setEditing(null);
    reload();
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.events.remove(deleting.id);
      toast.success('Event deleted');
      setDeleting(null);
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
        title="Events"
        subtitle="Browse and manage campus events."
        actions={<Button onClick={() => setEditing({})}><Plus size={16} /> Create event</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={changeFilter(setSearch)} placeholder="Search title or venue" />
        <Select className="sm:w-48" value={category} onChange={changeFilter(setCategory)} options={EVENT_CATEGORIES} placeholder="All categories" />
      </div>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : data.data.length === 0 ? (
        <div className="card"><EmptyState title="No events found" hint="Try changing the search or filter." /></div>
      ) : (
        <>
          <div className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-50' : ''}`}>
            {data.data.map((ev) => (
              <EventCard key={ev.id} event={ev} onEdit={setEditing} onDelete={setDeleting} />
            ))}
          </div>
          <div className="card mt-5">
            <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />
          </div>
        </>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Edit event' : 'Create event'} onClose={() => setEditing(null)}>
        {editing && <EventForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        message={`Delete "${deleting?.title}"? All its registrations will be removed.`}
        loading={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
