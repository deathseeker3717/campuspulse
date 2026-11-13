import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { Field, Select } from '../ui/Field.jsx';
import { DEPARTMENTS, YEARS } from '../../utils/constants.js';

const EMPTY = { name: '', email: '', roll_no: '', department: '', year: '', phone: '' };

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));

  function validate() {
    const e = {};
    if (!values.name.trim()) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Enter a valid email';
    if (!values.roll_no.trim()) e.roll_no = 'Roll number is required';
    if (!values.department) e.department = 'Choose a department';
    if (!values.year) e.year = 'Choose a year';
    if (values.phone && !/^\d{10}$/.test(values.phone)) e.phone = 'Phone must be 10 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() });
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name" error={errors.name}>
        <input className="input" value={values.name} onChange={(e) => set('name')(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" value={values.email} onChange={(e) => set('email')(e.target.value)} />
        </Field>
        <Field label="Roll number" error={errors.roll_no}>
          <input className="input" value={values.roll_no} onChange={(e) => set('roll_no')(e.target.value)} />
        </Field>
        <Field label="Department" error={errors.department}>
          <Select value={values.department} onChange={set('department')} options={DEPARTMENTS} placeholder="Select..." />
        </Field>
        <Field label="Year" error={errors.year}>
          <Select value={values.year} onChange={set('year')} options={YEARS.map((y) => ({ value: y, label: `Year ${y}` }))} placeholder="Select..." />
        </Field>
      </div>
      <Field label="Phone (optional)" error={errors.phone}>
        <input className="input" inputMode="numeric" maxLength={10} value={values.phone || ''} onChange={(e) => set('phone')(e.target.value)} />
      </Field>
      {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{serverError}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial?.id ? 'Save changes' : 'Add student'}</Button>
      </div>
    </form>
  );
}
