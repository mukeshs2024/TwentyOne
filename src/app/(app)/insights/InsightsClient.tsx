"use client";

import { useRouter } from "next/navigation";
import { Clock, Target, CalendarDays, BrainCircuit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ExecutionChart, TimeChart } from "./InsightsCharts";

type Props = {
  data: {
     summary: { focusHours: number; focusMins: number; executionRate: number; activeDays: number; completedTargets: number; partialTargets: number; skippedTargets: number; plannedMins: number; actualMins: number; averageFocusSession: number; planningAccuracy: number; totalTargets: number };
     growth: { focus: { current: number; previous: number }; execution: { current: number; previous: number }; };
     executionChartData: Array<{ date: string; completed: number; total: number; skipped: number }>;
     timeChartData: Array<{ date: string; planned: number; actual: number }>;
     patterns: string[];
  };
  currentDays: 7 | 21 | 30 | 90;
};

export default function InsightsClient({ data, currentDays }: Props) {
  const router = useRouter();

  const handleRangeChange = (days: number) => {
    router.push(`/insights?days=${days}`);
  };

  const GrowthIndicator = ({ current, previous, suffix = "", invert = false }: { current: number; previous: number; suffix?: string; invert?: boolean }) => {
     if (current === previous) return <div className="text-slate-400 flex items-center text-xs font-bold"><Minus className="w-3 h-3 mr-1" /> Flat</div>;
     const isPositive = current > previous;
     const isGood = invert ? !isPositive : isPositive;
     const diff = Math.abs(current - previous);
     
     return (
        <div className={`flex items-center text-xs font-bold ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
           {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
           {diff}{suffix}
        </div>
     );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
       
       {/* HEADER */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Insights</h1>
             <p className="text-slate-500 text-lg">See how your time, execution, and learning are evolving.</p>
          </div>
          
          <div className="flex p-1 bg-slate-200/50 rounded-full w-fit">
             {[7, 21, 30, 90].map((d) => (
                <button
                   key={d}
                   onClick={() => handleRangeChange(d)}
                   className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                      currentDays === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                   }`}
                >
                   {d} days
                </button>
             ))}
          </div>
       </div>

       {/* TOP SUMMARY */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-500" />
                   </div>
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus Time</div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{data.summary.focusHours}h {data.summary.focusMins}m</div>
                <GrowthIndicator current={data.growth.focus.current} previous={data.growth.focus.previous} suffix="h" />
             </div>
          </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                       <Target className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Execution Rate</div>
                 </div>
                 {data.summary.totalTargets === 0 ? (
                    <div className="text-lg font-bold text-slate-400 mb-2 mt-2">No targets planned</div>
                 ) : (
                    <>
                       <div className="text-3xl font-bold text-slate-900 mb-1">{data.summary.executionRate}%</div>
                       <div className="text-xs font-bold text-slate-400 mb-3">{data.summary.completedTargets} completed, {data.summary.partialTargets} partial</div>
                       <GrowthIndicator current={data.growth.execution.current} previous={data.growth.execution.previous} suffix="%" />
                    </>
                 )}
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                       <CalendarDays className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Days</div>
                 </div>
                 <div className="text-3xl font-bold text-slate-900 mb-1">{data.summary.activeDays}</div>
                 <div className="text-xs font-bold text-slate-400">Out of last {currentDays} days</div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                       <BrainCircuit className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Accuracy</div>
                 </div>
                 <div className="text-3xl font-bold text-slate-900 mb-2">{data.summary.planningAccuracy}%</div>
                 <div className="text-xs font-bold text-slate-400">Accuracy between planned vs actual time</div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* SEC 1: EXECUTION */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Execution</h2>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Completion Trend</h3>
                 {data.summary.totalTargets === 0 ? (
                    <div className="h-72 flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl">
                       No execution data available.
                    </div>
                 ) : (
                    <ExecutionChart data={data.executionChartData} />
                 )}
              </div>
           </div>

           {/* SEC 2: TIME */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Time Variance</h2>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Plan vs Actual</h3>
                       {data.summary.totalTargets > 0 && (
                          <p className="text-xs font-bold text-slate-500">
                             Average focus session: {data.summary.averageFocusSession}m
                          </p>
                       )}
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Planned</div>
                       <div className="text-sm font-bold text-slate-600 mb-2">{Math.floor(data.summary.plannedMins / 60)}h {data.summary.plannedMins % 60}m</div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actual</div>
                       <div className="text-sm font-bold text-slate-900">{Math.floor(data.summary.actualMins / 60)}h {data.summary.actualMins % 60}m</div>
                    </div>
                 </div>
                 {data.summary.totalTargets === 0 ? (
                    <div className="h-72 flex items-center justify-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl">
                       No time data available.
                    </div>
                 ) : (
                    <TimeChart data={data.timeChartData} />
                 )}
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-12">

          {/* SEC 5: PATTERNS */}
          <div className="space-y-6">
             <h2 className="text-xl font-bold text-slate-900">Behavioral Patterns</h2>
             <div className="bg-slate-900 p-8 rounded-3xl shadow-md text-white h-full">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">AI Heuristics</h3>
                <div className="space-y-6">
                   {data.patterns.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-4">
                         <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                         <p className="text-slate-300 leading-relaxed font-medium">{p}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>

    </div>
  );
}
