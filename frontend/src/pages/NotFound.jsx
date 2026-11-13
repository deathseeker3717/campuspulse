import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <p className="mt-2 text-slate-500">That page does not exist.</p>
      <Link to="/" className="mt-4 inline-block font-semibold text-brand-600 hover:underline">Back to dashboard</Link>
    </div>
  );
}
