"use client";

import { DayRecord } from "./actions";
import { format, subDays, startOfWeek, addDays } from "date-fns";

type Props = {
  timeline: DayRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function ActivityCalendar({ timeline, selectedDate, onSelectDate }: Props) {
  // Generate a classic 90-day contribution grid.
  // We want to end on "today" and go back exactly 90 days.
  const today = new Date();
  
  // A standard grid is usually 7 rows (Sunday - Saturday)
  const days: Date[] = [];
  for (let i = 89; i >= 0; i--) {
     days.push(subDays(today, i));
  }

  // To properly align columns by week, we need to pad the start with empty cells
  // if the 90th day ago is not a Sunday.
  const firstDay = days[0];
  const startOfFirstWeek = startOfWeek(firstDay);
  
  const paddedDays: (Date | null)[] = [];
  
  let curr = startOfFirstWeek;
  while (curr < firstDay) {
     paddedDays.push(null); // Empty padding cells
     curr = addDays(curr, 1);
  }
  
  // Now add our actual 90 days
  days.forEach(d => paddedDays.push(d));

  // The grid is rendered top-to-bottom, left-to-right natively by CSS Grid if we use grid-flow-col
  const getIntensityClass = (d: Date) => {
     const dateStr = format(d, "yyyy-MM-dd");
     const record = timeline.find(r => r.date === dateStr);
     if (!record) return "bg-slate-100 hover:bg-slate-200 border-transparent";
     
     if (record.intensity === 3) return "bg-orange-500 hover:bg-orange-600 border-orange-600 text-white shadow-sm";
     if (record.intensity === 2) return "bg-orange-400 hover:bg-orange-500 border-transparent text-white";
     if (record.intensity === 1) return "bg-orange-200 hover:bg-orange-300 border-transparent";
     return "bg-slate-100 hover:bg-slate-200 border-transparent";
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-6 overflow-x-auto pb-4 custom-scrollbar">
         {/* We use grid-rows-7 grid-flow-col for a GitHub style graph */}
         <div className="grid grid-rows-7 grid-flow-col gap-2">
            {paddedDays.map((d, i) => {
               if (!d) return <div key={`pad-${i}`} className="w-8 h-8 rounded-lg" />;
               
               const dateStr = format(d, "yyyy-MM-dd");
               const isSelected = dateStr === selectedDate;
               
               return (
                  <button
                     key={dateStr}
                     onClick={() => onSelectDate(dateStr)}
                     title={format(d, "MMM d, yyyy")}
                     className={`w-8 h-8 rounded-lg border transition-all text-[10px] font-bold ${getIntensityClass(d)} ${
                        isSelected ? "ring-2 ring-slate-900 ring-offset-2 scale-110 z-10" : "scale-100"
                     }`}
                  >
                     {format(d, "d")}
                  </button>
               );
            })}
         </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider justify-end">
         <span>Less</span>
         <div className="w-3 h-3 rounded-sm bg-slate-100" />
         <div className="w-3 h-3 rounded-sm bg-orange-200" />
         <div className="w-3 h-3 rounded-sm bg-orange-400" />
         <div className="w-3 h-3 rounded-sm bg-orange-500" />
         <span>More</span>
      </div>
    </div>
  );
}
