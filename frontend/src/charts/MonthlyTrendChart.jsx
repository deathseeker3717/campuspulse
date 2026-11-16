import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS, COLORS, GRID } from './palette.js';
import { monthLabel } from '../utils/format.js';

export default function MonthlyTrendChart({ data }) {
  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={rows} margin={{ left: 0, right: 20, top: 10 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} />
        <YAxis tick={AXIS} allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="registrations" name="Registrations" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
