"use client";

import { Battery, BatteryFull, BatteryWarning, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function formatFocusTime(totalMinutes: number) {
  return {
    hours: Math.floor(totalMinutes / 60),
    mins: totalMinutes % 60
  };
}

type DayCapacityWidgetProps = {
  plannedMinutes: number;
  availableMinutes: number | null;
};

export default function DayCapacityWidget({ plannedMinutes, availableMinutes }: DayCapacityWidgetProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!availableMinutes) return null;

  const { hours: pM, mins: pMins } = formatFocusTime(plannedMinutes);
  const { hours: aM, mins: aMins } = formatFocusTime(availableMinutes);
  
  const plannedText = `${pM > 0 ? `${pM}h ` : ""}${pMins}m`;
  const availableText = `${aM > 0 ? `${aM}h ` : ""}${aMins}m`;

  const difference = plannedMinutes - availableMinutes;
  const isOver = difference > 0;
  const absDiff = Math.abs(difference);
  const { hours: diffH, mins: diffM } = formatFocusTime(absDiff);
  const diffText = `${diffH > 0 ? `${diffH}h ` : ""}${diffM}m`;

  let statusColor = "text-emerald-600";
  let bgClass = "bg-emerald-50 border-emerald-100";
  let Icon = Battery;
  
  if (isOver) {
    statusColor = "text-red-600";
    bgClass = "bg-red-50 border-red-100";
    Icon = BatteryWarning;
  } else if (plannedMinutes >= availableMinutes * 0.8) {
    statusColor = "text-orange-600";
    bgClass = "bg-orange-50 border-orange-100";
    Icon = BatteryFull;
  }



  return (
    <>
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between shadow-sm transition-colors ${bgClass}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-white ${statusColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Today&apos;s Capacity</p>
             <p className="text-xl font-bold text-slate-900 mb-1">
               {availableText} available
             </p>
             <div className="flex flex-col text-sm font-medium text-slate-600">
               <span>{plannedText} planned</span>
               {isOver && (
                  <span className="text-red-600 font-bold mt-0.5">+{diffText} over capacity</span>
               )}
             </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end justify-center">
          {isOver ? (
             <Button 
               onClick={() => setIsReviewOpen(true)}
               variant="outline" 
               className="border-red-200 text-red-700 bg-white hover:bg-red-50 hover:border-red-300 font-bold shadow-sm rounded-xl h-12 px-6"
             >
               Review plan
             </Button>
          ) : (
             <p className={`text-sm font-bold ${statusColor} bg-white px-4 py-2 rounded-lg`}>
               {difference === 0 ? `Perfectly balanced` : `${diffText} remaining`}
             </p>
          )}
        </div>
      </div>

      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                 <h2 className="text-xl font-bold text-slate-900">Review Plan</h2>
              </div>
              
              <p className="text-slate-600 font-medium mb-6">
                 Your plan exceeds today&apos;s available focus by <span className="font-bold text-slate-900">{difference} minutes</span>. Choose what to do:
              </p>
              
              <div className="space-y-3 mb-8">
                 <button onClick={() => setIsReviewOpen(false)} className="w-full flex items-center justify-between text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <span className="font-bold text-slate-900">Keep all targets</span>
                 </button>
                 <button onClick={() => { /* Feature coming soon */ setIsReviewOpen(false); }} className="w-full flex items-center justify-between text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <span className="font-bold text-slate-900">Reduce target duration</span>
                 </button>
                 <button onClick={() => { /* Feature coming soon */ setIsReviewOpen(false); }} className="w-full flex items-center justify-between text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <span className="font-bold text-slate-900">Move a target to another day</span>
                 </button>
                 <button onClick={() => { /* Feature coming soon */ setIsReviewOpen(false); }} className="w-full flex items-center justify-between text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                    <span className="font-bold text-slate-900">Remove a target</span>
                 </button>
              </div>
              
              <Button onClick={() => setIsReviewOpen(false)} variant="ghost" className="w-full text-slate-500 hover:bg-slate-100 font-bold">
                 Cancel
              </Button>
           </div>
        </div>
      )}
    </>
  );
}
