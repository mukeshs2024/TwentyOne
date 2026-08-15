"use client";

import { DayRecord, TimelineEvent } from "./actions";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, MinusCircle, PlayCircle, StopCircle } from "lucide-react";

type Props = {
  record: DayRecord;
};

export default function DayTimeline({ record }: Props) {
  const displayDate = record.date ? format(new Date(record.date), "MMMM d, yyyy") : "No Date";
  
  const hasActivity = record.stats.totalTargets > 0 || record.stats.actualMins > 0 || record.timeline.length > 0;

  const EventIcon = ({ type }: { type: TimelineEvent['type'] }) => {
     switch (type) {
        case 'TARGET_COMPLETED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'FOCUS': return <Clock className="w-5 h-5 text-orange-500" />;
        default: return <Circle className="w-5 h-5 text-slate-300" />;
     }
  };

  const getTargetIcon = (status: string) => {
     switch (status) {
        case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'PARTIAL': return <StopCircle className="w-5 h-5 text-slate-400" fill="currentColor" stroke="white" />;
        case 'IN_PROGRESS': return <PlayCircle className="w-5 h-5 text-orange-500" fill="currentColor" stroke="white" />;
        case 'SKIPPED': return <MinusCircle className="w-5 h-5 text-slate-300" />;
        default: return <Circle className="w-5 h-5 text-slate-300" />; // PENDING/NOT STARTED
     }
  };

  const completionRate = record.stats.plannedMins > 0 
     ? Math.round((record.stats.actualMins / record.stats.plannedMins) * 100) 
     : 0;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">My Record</h2>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-8">{displayDate}</h1>

      {/* Execution Summary Panel */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-10 flex flex-wrap gap-8 items-center">
         <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
               {Math.floor(record.stats.plannedMins / 60)}h {record.stats.plannedMins % 60}m
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planned Time</div>
         </div>
         <div className="h-10 w-px bg-slate-100 hidden sm:block" />
         <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
               {Math.floor(record.stats.actualMins / 60)}h {record.stats.actualMins % 60}m
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Time</div>
         </div>
         <div className="h-10 w-px bg-slate-100 hidden sm:block" />
         <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
               {completionRate}%
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</div>
         </div>
      </div>

      {/* Targets Section */}
      {record.targets && record.targets.length > 0 && (
         <div className="mb-12">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Targets</h3>
            <div className="space-y-3">
               {record.targets.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {getTargetIcon(t.status)}
                        <div>
                           <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                           <span className="text-xs font-semibold text-slate-400">{t.category}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-slate-700">{Math.round(t.actualDuration)}m <span className="text-slate-400 font-medium">/ {t.plannedDuration}m</span></div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.status.replace('_', ' ')}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Chronological Timeline */}
      <div>
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Activity Timeline</h3>
         
         {!hasActivity ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
               <p className="text-slate-500 font-medium">No activity recorded on this day.</p>
            </div>
         ) : (
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
               {record.timeline.map((event, i) => (
                  <div key={event.id + i} className="relative">
                     <div className="absolute -left-[35px] bg-slate-50 p-1 rounded-full">
                        <EventIcon type={event.type} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-xs font-bold text-slate-400 tracking-wider">
                              {format(new Date(event.time), "h:mm a")}
                           </span>
                           {event.subtitle && (
                               <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                 event.type === 'FOCUS' ? 'bg-orange-100 text-orange-600' : 
                                 'bg-slate-100 text-slate-500'
                               }`}>
                                 {event.subtitle}
                              </span>
                           )}
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">{event.title}</h4>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
