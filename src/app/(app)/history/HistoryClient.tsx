"use client";

import { useState } from "react";
import { DayRecord } from "./actions";
import ActivityCalendar from "./ActivityCalendar";
import DayTimeline from "./DayTimeline";

type Props = {
  initialTimeline: DayRecord[];
};

export default function HistoryClient({ initialTimeline }: Props) {
  // Use YYYY-MM-DD for simple string-based selection
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const selectedDayRecord = initialTimeline.find(d => d.date === selectedDate) || {
    date: selectedDate,
    intensity: 0 as const,
    stats: { totalTargets: 0, completedTargets: 0, plannedMins: 0, actualMins: 0 },
    targets: [],
    timeline: []
  };

  if (initialTimeline.length === 0 || initialTimeline.every(d => d.stats.totalTargets === 0 && d.stats.actualMins === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6">
           <span className="text-2xl">⏳</span>
        </div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Your Execution History</h2>
        <p className="text-lg font-medium text-slate-900 max-w-md mb-8">
           Your completed focus sessions and daily plans will appear here. Start your first focus session to begin building your record.
        </p>
        <a 
           href="/today"
           className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-sm transition-colors"
        >
           Go to Today
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row h-full">
       {/* Left side: The Calendar */}
       <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto p-8">
          <div className="mb-8">
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">History</h1>
             <p className="text-sm font-medium text-slate-500">
                Your execution record over time.
             </p>
          </div>

          <ActivityCalendar 
             timeline={initialTimeline} 
             selectedDate={selectedDate}
             onSelectDate={setSelectedDate}
          />
       </div>

       {/* Right side: Day Detail & Timeline Feed */}
       <div className="flex-1 bg-slate-50 overflow-y-auto p-8">
          <DayTimeline record={selectedDayRecord} />
       </div>
    </div>
  );
}
