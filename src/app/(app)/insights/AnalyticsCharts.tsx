"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type FocusData = { date: string; minutes: number };
type PlanningData = { date: string; planned: number; actual: number };
type CategoryData = { name: string; value: number };

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#64748b"];

export function AnalyticsCharts({
  focusTrendData,
  planningTrendData,
  categoryDistributionData,
}: {
  focusTrendData: FocusData[];
  planningTrendData: PlanningData[];
  categoryDistributionData: CategoryData[];
}) {
  return (
    <div className="space-y-8">
      {/* Planned vs Actual Focus */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Planned vs Actual Focus (Hours)</CardTitle>
          <p className="text-slate-500 text-sm">Compare your estimated target durations against real logged execution time.</p>
        </CardHeader>
        <CardContent className="p-8 pt-0 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={planningTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px', fontWeight: 'bold' }}
                cursor={{ stroke: '#f1f5f9', strokeWidth: 20 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="planned" name="Planned (h)" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, fill: '#94a3b8' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="actual" name="Actual (h)" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Focus Trend */}
        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Daily Focus Volume</CardTitle>
            <p className="text-slate-500 text-sm">Total minutes focused per day.</p>
          </CardHeader>
          <CardContent className="p-8 pt-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusTrendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="minutes" fill="#f97316" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-bold text-slate-900">Category Focus Distribution</CardTitle>
            <p className="text-slate-500 text-sm">Where your time goes.</p>
          </CardHeader>
          <CardContent className="p-8 h-[300px]">
            {categoryDistributionData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-400">
                 No category data available yet.
               </div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryDistributionData}
                     cx="50%"
                     cy="50%"
                     innerRadius={70}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {categoryDistributionData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                   />
                   <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ paddingLeft: '20px' }} />
                 </PieChart>
               </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
