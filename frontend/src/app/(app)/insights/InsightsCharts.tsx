"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function ExecutionChart({ data }: { data: Array<{ date: string; completed: number; total: number; skipped: number }> }) {
  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} minTickGap={20} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
          <Tooltip 
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
          />
          <Area type="monotone" dataKey="total" name="Planned" stroke="#94a3b8" fillOpacity={1} fill="url(#colorTotal)" />
          <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TimeChart({ data }: { data: Array<{ date: string; planned: number; actual: number }> }) {
  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} minTickGap={20} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
          <Tooltip 
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             cursor={{ fill: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="planned" name="Planned (h)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual (h)" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

