import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS, COLORS, GRID } from './palette.js';

export default function AttendanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 30 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="title" tick={AXIS} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={AXIS} domain={[0, 100]} unit="%" />
        <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="percentage" name="Attendance" fill={COLORS[2]} radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
