import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { Field, Select } from '../ui/Field.jsx';
import { EVENT_CATEGORIES } from '../../utils/constants.js';
import { toInputDate } from '../../utils/format.js';

const EMPTY = { title: '', description: '', category: '', venue: '', event_date: '', capacity: '' };

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial, event_date: toInputDate(initial?.event_date) });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));

  function validate() {
    const e = {};
    if (!values.title.trim()) e.title = 'Title is required';
    if (!values.category) e.category = 'Choose a category';
    if (!values.venue.trim()) e.venue = 'Venue is required';
    if (!values.event_date) e.event_date = 'Pick a date';
    if (!(Number(values.capacity) > 0)) e.capacity = 'Capacity must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      // send only the editable columns
      const { title, description, category, venue, event_date, capacity } = values;
      await onSubmit({ title: title.trim(), description, category, venue: venue.trim(), event_date, capacity: Number(capacity) });
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title" error={errors.title}>
        <input className="input" value={values.title} onChange={(e) => set('title')(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" error={errors.category}>
          <Select value={values.category} onChange={set('category')} options={EVENT_CATEGORIES} placeholder="Select..." />
        </Field>
        <Field label="Date" error={errors.event_date}>
          <input className="input" type="date" value={values.event_date} onChange={(e) => set('event_date')(e.target.value)} />
        </Field>
        <Field label="Venue" error={errors.venue}>
          <input className="input" value={values.venue} onChange={(e) => set('venue')(e.target.value)} />
        </Field>
        <Field label="Capacity" error={errors.capacity}>
          <input className="input" type="number" min="1" value={values.capacity} onChange={(e) => set('capacity')(e.target.value)} />
        </Field>
      </div>
      <Field label="Description">
        <textarea className="input min-h-[90px]" value={values.description || ''} onChange={(e) => set('description')(e.target.value)} />
      </Field>
      {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{serverError}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial?.id ? 'Save changes' : 'Create event'}</Button>
      </div>
    </form>
  );
}
