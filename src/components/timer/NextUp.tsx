"use client";

import { CheckCircle2, Play, Pause, Target as TargetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import TargetPlannerModal, { TargetData } from "../targets/TargetPlannerModal";
import { createTarget, logTargetSession, setNextTarget } from "@/app/(app)/today/actions";

type Target = {
  id: string;
  title: string;
  category: string;
  estimatedDuration: number;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  sessions?: { duration: number | null }[];
  isNext?: boolean;
  executionOrder?: number;
};

type TimerState = {
  status: "IDLE" | "RUNNING" | "PAUSED";
  startedAt: number | null;
  lastResumedAt: number | null;
  accumulatedMs: number;
};

export default function NextUp({ targets, suggestedTargetId }: { targets: Target[], suggestedTargetId: string | null }) {
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isChoosingTarget, setIsChoosingTarget] = useState(false);
  
  const target = targets.find(t => t.id === suggestedTargetId);

  // Timer State
  const [state, setState] = useState<TimerState>({
    status: "IDLE",
    startedAt: null,
    lastResumedAt: null,
    accumulatedMs: 0,
  });
  const [displayMs, setDisplayMs] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const storageKey = target ? `twentyone_focus_${target.id}` : "twentyone_focus_none";

  // Restore State from LocalStorage
  useEffect(() => {
    if (!target) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TimerState;
        setState(parsed);
      } catch {
        // invalid state
      }
    } else {
        setState({
          status: "IDLE",
          startedAt: null,
          lastResumedAt: null,
          accumulatedMs: 0,
        });
        setDisplayMs(0);
    }
  }, [storageKey, target]);

  // Persist State
  useEffect(() => {
    if (state.status !== "IDLE" || state.accumulatedMs > 0) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  // Display Loop
  useEffect(() => {
    let animationFrameId: number;
    const tick = () => {
      if (state.status === "RUNNING" && state.lastResumedAt) {
        setDisplayMs(state.accumulatedMs + (Date.now() - state.lastResumedAt));
      } else {
        setDisplayMs(state.accumulatedMs);
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [state]);

  const handleStart = () => {
    const now = Date.now();
    setState((prev) => ({
      status: "RUNNING",
      startedAt: prev.startedAt || now,
      lastResumedAt: now,
      accumulatedMs: prev.accumulatedMs,
    }));
  };

  const handlePause = () => {
    if (state.status !== "RUNNING" || !state.lastResumedAt) return;
    const currentRunMs = Date.now() - state.lastResumedAt;
    setState((prev) => ({
      ...prev,
      status: "PAUSED",
      lastResumedAt: null,
      accumulatedMs: prev.accumulatedMs + currentRunMs,
    }));
  };

  const handleFinalize = async (status: "COMPLETED" | "PARTIAL") => {
    if (!target) return;
    setIsFinishing(true);
    
    // Ensure we capture whatever the current displayMs is (if they hit finish while running)
    const finalAccumulated = state.status === "RUNNING" && state.lastResumedAt 
      ? state.accumulatedMs + (Date.now() - state.lastResumedAt) 
      : displayMs;
      
    if (state.status === "RUNNING") {
       handlePause();
    }
    
    const durationMinutes = Math.floor(finalAccumulated / 60000);
    const minsToLog = durationMinutes > 0 ? durationMinutes : 1;
    
    const end = new Date();
    const start = state.startedAt ? new Date(state.startedAt) : new Date(end.getTime() - minsToLog * 60000);

    try {
       await logTargetSession(target.id, start, end, minsToLog, status);
       localStorage.removeItem(storageKey);
       setState({ status: "IDLE", startedAt: null, lastResumedAt: null, accumulatedMs: 0 });
       setDisplayMs(0);
       setIsFinishing(false);
    } catch {
       setIsFinishing(false);
       alert("Failed to save session. Please try again.");
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveTarget = async (data: TargetData) => {
     await createTarget({
        title: data.title,
        category: data.category,
        estimatedDuration: data.estimatedDuration,
        priority: data.priority,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        description: data.description,
     });
     setIsPlannerOpen(false);
  };

  if (targets.length === 0) {
     return (
        <div className="bg-slate-50 rounded-xl p-8 flex flex-col items-start shadow-sm border border-slate-100">
           <h3 className="text-2xl font-bold text-slate-900 mb-2">No target planned yet.</h3>
           <p className="text-slate-500 font-medium mb-6">Use your available time intentionally.</p>
           <Button onClick={() => setIsPlannerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 font-bold">
              + Plan target
           </Button>
           
           <TargetPlannerModal 
             isOpen={isPlannerOpen} 
             onClose={() => setIsPlannerOpen(false)} 
             onSave={handleSaveTarget}
           />
        </div>
     );
  }

  const eligibleTargets = targets.filter(t => t.status !== "COMPLETED" && t.status !== "SKIPPED" && t.status !== "MISSED");

  if (eligibleTargets.length === 0) {
     return (
        <div className="bg-emerald-50 rounded-xl p-8 flex flex-col items-start border border-emerald-100">
           <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
           <h3 className="text-2xl font-bold text-emerald-900 mb-1">You&apos;re all caught up.</h3>
           <p className="text-emerald-700 font-medium">All targets for today are completed.</p>
        </div>
     );
  }

  if (!target) {
     return (
        <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-start shadow-md border border-slate-800">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">What&apos;s Next?</h3>
           <p className="text-2xl text-white font-bold mb-6">Choose what you want to focus on.</p>
           
           <div className="flex items-center gap-4">
              <Button onClick={() => setIsChoosingTarget(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 h-12 font-bold shadow-md">
                 Choose target →
              </Button>
              <span className="text-slate-400 font-medium text-sm">{eligibleTargets.length} targets planned</span>
           </div>
           
           {isChoosingTarget && (
             <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Choose what to focus on</h2>
                   
                   <div className="space-y-3 mb-8">
                     {eligibleTargets.map(t => (
                        <button 
                          key={t.id}
                          onClick={async () => {
                             await setNextTarget(t.id);
                             setIsChoosingTarget(false);
                          }}
                          className="w-full flex flex-col text-left p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                           <span className="font-bold text-slate-900">{t.title}</span>
                           <span className="text-sm text-slate-500">{t.estimatedDuration} min</span>
                        </button>
                     ))}
                   </div>
                   
                   <Button onClick={() => setIsChoosingTarget(false)} variant="ghost" className="w-full text-slate-500 hover:bg-slate-100">
                      Cancel
                   </Button>
                </div>
             </div>
           )}
        </div>
     );
  }

  const previouslyFocusedMins = target.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;

  return (
    <div className="relative bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800 transition-all duration-500">
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Info */}
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider flex items-center">
                 <TargetIcon className="w-4 h-4 mr-2 text-orange-500" /> {target.category}
              </span>
           </div>
           <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 pr-4 text-white leading-tight">
             {target.title}
           </h2>
           
           <div className="flex items-center gap-4 text-sm font-medium text-slate-400 mt-2">
              {state.status === "IDLE" ? (
                 <>
                   <span>{target.estimatedDuration} min planned</span>
                   <span>•</span>
                   <span>{previouslyFocusedMins} min focused</span>
                 </>
              ) : (
                 <span className="font-mono text-xl text-white font-bold tracking-widest">{formatTime(displayMs)}</span>
              )}
           </div>
        </div>

        {/* Right Timer & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end w-full md:w-auto gap-3">
           {state.status === "IDLE" && (
             <Button
               onClick={handleStart}
               className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-14 px-8 shadow-md text-lg font-bold transition-all"
             >
               <Play className="w-5 h-5 mr-2 fill-current" /> Start Focus
             </Button>
           )}

           {state.status === "RUNNING" && (
             <Button
               onClick={handlePause}
               className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-14 px-8 shadow-md text-lg font-bold border border-slate-700 transition-all"
             >
               <Pause className="w-5 h-5 mr-2 fill-current" /> Pause Focus
             </Button>
           )}

           {state.status === "PAUSED" && (
             <>
               <Button
                 onClick={handleStart}
                 className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-14 px-8 text-lg font-bold border border-slate-700 transition-all"
               >
                 <Play className="w-5 h-5 mr-2 fill-current" /> Resume
               </Button>
               <Button
                 onClick={() => handleFinalize("COMPLETED")}
                 disabled={isFinishing}
                 className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-14 px-8 shadow-md text-lg font-bold transition-all"
               >
                 {isFinishing ? "Saving..." : <><CheckCircle2 className="w-5 h-5 mr-2" /> Done</>}
               </Button>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
