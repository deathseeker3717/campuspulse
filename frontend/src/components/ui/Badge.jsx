const TONES = {
  slate: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
};

export default function Badge({ tone = 'slate', children }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

const CATEGORY_TONE = { Technical: 'indigo', Cultural: 'amber', Sports: 'green', Workshop: 'sky', Seminar: 'slate' };
export const categoryTone = (c) => CATEGORY_TONE[c] || 'slate';
