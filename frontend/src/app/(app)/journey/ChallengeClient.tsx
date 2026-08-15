"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startChallenge, logChallengeDay } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Circle, Flag, Target, Loader2, Star, Calendar, Target as TargetIcon, Clock, BarChart3, ChevronRight } from "lucide-react";
import { format, isToday, isPast } from "date-fns";

export type ChallengeDayType = {
  id: string;
  dayNumber: number;
  date: Date;
  status: "SUCCESS" | "PARTIAL" | "MISSED";
};

export type ChallengeType = {
  id: string;
  title: string;
  goal: string | null;
  days: ChallengeDayType[];
};

export function ChallengeClient({ activeChallenge }: { activeChallenge: ChallengeType | null }) {
  const [isPending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<ChallengeDayType | null>(null);

  if (!activeChallenge) {
    return (
      <div className="bg-white p-10 md:p-12 border border-slate-200 rounded-3xl shadow-sm max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flag className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Commit to 21 Days</h2>
          <p className="text-slate-500 mt-3 text-lg leading-relaxed">Commit to 21 days of consistent execution. Plan daily, execute deeply, and transform your trajectory.</p>
        </div>

        <form action={(formData) => startTransition(() => startChallenge(formData))} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Challenge Focus</label>
            <Input name="title" placeholder="e.g., Build MVP, Learn Systems Design, Write Book" required className="bg-slate-50 border-transparent focus:border-orange-500 focus:bg-white text-lg py-6 rounded-xl transition-colors" />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ultimate Goal</label>
            <Textarea name="goal" placeholder="What does success look like after 21 days?" required className="bg-slate-50 border-transparent focus:border-orange-500 focus:bg-white min-h-[120px] text-lg p-4 rounded-xl transition-colors" />
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-7 text-lg rounded-2xl font-bold mt-4 shadow-xl shadow-slate-900/10" disabled={isPending}>
            {isPending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Target className="w-5 h-5 mr-3" />}
            Start Journey
          </Button>
        </form>
      </div>
    );
  }

  const totalSuccess = activeChallenge.days.filter((d) => d.status === "SUCCESS").length;
  const progress = Math.round((totalSuccess / 21) * 100);

  const handleLogDay = (dayId: string, status: "SUCCESS" | "PARTIAL" | "MISSED") => {
    startTransition(() => logChallengeDay(dayId, status));
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-10 border border-slate-800 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
          <Star className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-3 text-orange-400 font-bold text-sm tracking-widest uppercase mb-4">
            <Star className="w-5 h-5 fill-current" />
            <span>Active Journey</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{activeChallenge.title}</h2>
          <p className="text-slate-400 text-lg leading-relaxed">{activeChallenge.goal}</p>
        </div>
        
        <div className="relative z-10 text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl min-w-[240px] shrink-0">
          <p className="text-6xl font-bold text-white mb-2 tracking-tighter">{totalSuccess}<span className="text-3xl text-slate-500 font-medium">/21</span></p>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Days Won</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white p-8 md:p-10 border border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">The 21-Day Path</h3>
            <span className="font-bold text-orange-500 bg-orange-50 px-4 py-1.5 rounded-full">{progress}% Complete</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
            {activeChallenge.days.map((day, index, array) => {
              const isDayToday = isToday(new Date(day.date));
              const isPastDay = isPast(new Date(day.date)) && !isDayToday;
              
              let state: "LOCKED" | "AVAILABLE" | "CURRENT" | "COMPLETED" | "MISSED" = "LOCKED";
              
              if (day.status === "SUCCESS" || day.status === "PARTIAL") {
                 state = "COMPLETED";
              } else if (isPastDay) {
                 state = "MISSED";
              } else if (isDayToday) {
                 state = "CURRENT";
              } else {
                 // Future day. It is AVAILABLE only if all previous days are COMPLETED or MISSED, and it's the next immediate day.
                 const prevDay = index > 0 ? array[index - 1] : null;
                 const isPrevDone = prevDay ? (prevDay.status === "SUCCESS" || prevDay.status === "PARTIAL" || (isPast(new Date(prevDay.date)) && !isToday(new Date(prevDay.date)))) : true;
                 
                 // If it's in the future, it's generally locked. But we can mark it AVAILABLE if they are allowed to do it early. 
                 // Based on requirements, Day N is LOCKED if Day N-1 is not COMPLETED/MISSED.
                 if (isPrevDone) {
                    state = "AVAILABLE"; // Though technically they shouldn't do future days today, the state machine requires it.
                 } else {
                    state = "LOCKED";
                 }
              }

              const isLocked = state === "LOCKED";
              
              return (
                <motion.button 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  key={day.id}
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedDay(day)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    state === "COMPLETED" ? 'bg-orange-50 border-orange-200 hover:border-orange-300 shadow-sm' : 
                    state === "CURRENT" ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' : 
                    state === "AVAILABLE" ? 'bg-white border-slate-300 hover:border-slate-400 border-dashed' :
                    state === "MISSED" ? 'bg-slate-50 border-slate-200 opacity-70' :
                    'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0">
                       {state === "COMPLETED" ? (
                         <CheckCircle2 className="w-8 h-8 text-orange-500" />
                       ) : state === "CURRENT" ? (
                         <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
                       ) : state === "AVAILABLE" ? (
                         <Circle className="w-8 h-8 text-slate-300 border-dashed" />
                       ) : (
                         <Circle className={`w-8 h-8 ${state === "MISSED" ? 'text-slate-300' : 'text-slate-200'}`} />
                       )}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold uppercase tracking-widest text-xs mb-0.5 ${
                         state === "CURRENT" ? 'text-slate-400' : 
                         state === "COMPLETED" ? 'text-orange-600/70' : 
                         state === "LOCKED" ? 'text-slate-400' :
                         'text-slate-500'
                      }`}>
                        Day {day.dayNumber} {state === "MISSED" && "(Missed)"}
                      </p>
                      <p className={`font-bold ${state === "CURRENT" ? 'text-white' : state === "LOCKED" ? 'text-slate-400' : 'text-slate-900'}`}>
                        {format(new Date(day.date), "MMM d")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${state === "CURRENT" ? 'text-slate-600' : state === "LOCKED" ? 'text-slate-200' : 'text-slate-300'}`} />
                </motion.button>
              );
            })}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
             <TargetIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Track Your Execution</h4>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Click on any day in the journey to view your detailed execution metrics, including focus time and your daily review.</p>
        </div>

      </div>

      {/* Detailed Day Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-3xl border-slate-200">
          {selectedDay && (
            <>
              <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Calendar className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-500 font-bold tracking-widest text-sm uppercase mb-2">Day {selectedDay.dayNumber}</p>
                  <h3 className="text-3xl font-bold">{format(new Date(selectedDay.date), "EEEE, MMMM do")}</h3>
                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={() => { handleLogDay(selectedDay.id, "SUCCESS"); setSelectedDay(null); }}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                      Mark Won
                    </Button>
                    <Button 
                      onClick={() => { handleLogDay(selectedDay.id, "MISSED"); setSelectedDay(null); }}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full px-6"
                    >
                      Reset Day
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <TargetIcon className="w-5 h-5 text-slate-400 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">4 / 5</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Targets</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Clock className="w-5 h-5 text-slate-400 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">3h 12m</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Focus</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <BarChart3 className="w-5 h-5 text-slate-400 mb-2" />
                    <p className="text-2xl font-bold text-slate-900">82</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-blue-500 fill-current" />
                    <p className="font-bold text-blue-900">Daily Review (4/5)</p>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">&quot;Great execution today. Handled all my core targets and finally understood the React concurrency model. Need to sleep earlier.&quot;</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
