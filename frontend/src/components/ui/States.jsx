import { AlertTriangle, Inbox } from 'lucide-react';
import Button from './Button.jsx';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', hint }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-500">
      <Inbox size={36} className="text-slate-300" />
      <p className="font-semibold text-slate-700">{title}</p>
      {hint && <p className="text-sm">{hint}</p>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle size={36} className="text-rose-400" />
      <p className="text-sm font-medium text-rose-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
