import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS, COLORS, GRID } from './palette.js';

export default function TopEventsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} allowDecimals={false} />
        <YAxis type="category" dataKey="title" width={140} tick={AXIS} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="registrations" name="Registrations" fill={COLORS[0]} radius={[0, 6, 6, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
