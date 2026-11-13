import PageHeader from '../components/ui/PageHeader.jsx';
import { EmptyState, ErrorBox, Spinner } from '../components/ui/States.jsx';
import TopEventsChart from '../charts/TopEventsChart.jsx';
import DepartmentChart from '../charts/DepartmentChart.jsx';
import MonthlyTrendChart from '../charts/MonthlyTrendChart.jsx';
import AttendanceChart from '../charts/AttendanceChart.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../services/api.js';

function Panel({ title, children, className = '' }) {
  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="mb-4 font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function Analytics() {
  const { data, loading, error, reload } = useFetch(async () => {
    const [top, departments, monthly, attendance] = await Promise.all([
      api.analytics.topEvents(),
      api.analytics.departments(),
      api.analytics.monthly(),
      api.analytics.attendance(),
    ]);
    return { top, departments, monthly, attendance };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const { top, departments, monthly, attendance } = data;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Rankings, trends and attendance across campus events." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top 5 popular events"><TopEventsChart data={top} /></Panel>
        <Panel title="Department-wise participation"><DepartmentChart data={departments} /></Panel>
        <Panel title="Monthly event participation"><MonthlyTrendChart data={monthly} /></Panel>
        <Panel title="Attendance % per event">
          {attendance.length === 0 ? <EmptyState title="No attendance recorded yet" /> : <AttendanceChart data={attendance} />}
        </Panel>
      </div>

      <section className="card mt-6">
        <h2 className="border-b border-slate-200 px-5 py-4 font-bold">Attendance report</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Event</th>
                <th className="th">Registered</th>
                <th className="th">Present</th>
                <th className="th">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((a) => (
                <tr key={a.event_id}>
                  <td className="td font-semibold">{a.title}</td>
                  <td className="td">{a.registered}</td>
                  <td className="td">{a.present}</td>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${a.percentage}%` }} />
                      </div>
                      <span className="font-semibold">{a.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
