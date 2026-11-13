import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, GraduationCap, Percent } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { ErrorBox, Spinner } from '../components/ui/States.jsx';
import Badge, { categoryTone } from '../components/ui/Badge.jsx';
import TopEventsChart from '../charts/TopEventsChart.jsx';
import MonthlyTrendChart from '../charts/MonthlyTrendChart.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { formatDate } from '../utils/format.js';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(async () => {
    const [summary, top, monthly, upcoming] = await Promise.all([
      api.analytics.summary(),
      api.analytics.topEvents(),
      api.analytics.monthly(),
      api.events.list({ limit: 100 }),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const next = upcoming.data.filter((e) => String(e.event_date).slice(0, 10) >= today).slice(0, 4);
    return { summary, top, monthly, next };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const { summary, top, monthly, next } = data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at what is happening on campus." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={summary.total_students} icon={GraduationCap} tone="indigo" />
        <StatCard label="Events" value={summary.total_events} icon={CalendarDays} tone="amber" />
        <StatCard label="Registrations" value={summary.total_registrations} icon={ClipboardList} tone="green" />
        <StatCard label="Avg. attendance" value={`${summary.avg_attendance}%`} icon={Percent} tone="rose" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Top 5 popular events</h2>
          <TopEventsChart data={top} />
        </section>
        <section className="card p-5">
          <h2 className="mb-4 font-bold">Monthly registrations</h2>
          <MonthlyTrendChart data={monthly} />
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Upcoming events</h2>
          <Link to="/events" className="text-sm font-semibold text-brand-600 hover:underline">See all</Link>
        </div>
        {next.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming events.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {next.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <Link to={`/events/${e.id}`} className="font-semibold hover:text-brand-600">{e.title}</Link>
                  <p className="text-xs text-slate-500">{formatDate(e.event_date)} &middot; {e.venue}</p>
                </div>
                <Badge tone={categoryTone(e.category)}>{e.category}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
