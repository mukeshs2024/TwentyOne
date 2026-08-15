"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type TargetData = {
  id?: string;
  title: string;
  category: string;
  estimatedDuration: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  startTime?: Date | null;
  endTime?: Date | null;
  description?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TargetData) => Promise<void>;
  initialData?: TargetData | null;
};

export default function TargetPlannerModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Execution");
  const [duration, setDuration] = useState("60");
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [description, setDescription] = useState("");
  const [timeMode, setTimeMode] = useState<"ANYTIME" | "SPECIFIC" | "RANGE">("ANYTIME");
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("10:00");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
       if (initialData) {
          setTitle(initialData.title);
          setCategory(initialData.category);
          setDuration(initialData.estimatedDuration.toString());
          setPriority(initialData.priority);
          setDescription(initialData.description || "");
          
          if (initialData.startTime && initialData.endTime) {
             setTimeMode("RANGE");
             setStartTimeStr(formatTimeInput(new Date(initialData.startTime)));
             setEndTimeStr(formatTimeInput(new Date(initialData.endTime)));
             setShowAdvanced(true);
          } else if (initialData.startTime) {
             setTimeMode("SPECIFIC");
             setStartTimeStr(formatTimeInput(new Date(initialData.startTime)));
             setShowAdvanced(true);
          } else {
             setTimeMode("ANYTIME");
          }
          
          if (initialData.priority !== "MEDIUM" || initialData.description) {
             setShowAdvanced(true);
          }
       } else {
          // Reset for new creation
          setTitle("");
          setCategory("Work");
          setDuration("60");
          setPriority("MEDIUM");
          setDescription("");
          setTimeMode("ANYTIME");
          setShowAdvanced(false);
          setErrorMsg("");
       }
    }
  }, [isOpen, initialData]);

  // Smart Defaults Engine
  useEffect(() => {
    if (!initialData && title.length > 3) {
      const lower = title.toLowerCase();
      if (lower.includes("read") || lower.includes("study") || lower.includes("learn") || lower.includes("course")) {
         setCategory("Learn");
      } else if (lower.includes("workout") || lower.includes("run") || lower.includes("lift") || lower.includes("gym")) {
         setCategory("Personal");
      }
    }
  }, [title, initialData]);

  const formatTimeInput = (d: Date) => {
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const parseTimeToTodayDate = (timeStr: string) => {
     const [h, m] = timeStr.split(":");
     const d = new Date();
     d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
     return d;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMsg("What do you want to accomplish? Title cannot be empty.");
      return;
    }
    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setErrorMsg("Estimated duration must be greater than 0.");
      return;
    }

    let start: Date | null = null;
    let end: Date | null = null;

    if (timeMode === "SPECIFIC" || timeMode === "RANGE") {
       start = parseTimeToTodayDate(startTimeStr);
    }
    if (timeMode === "RANGE") {
       end = parseTimeToTodayDate(endTimeStr);
       if (start && end && end <= start) {
          setErrorMsg("Impossible time range. End time must be after start time.");
          return;
       }
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await onSave({
        id: initialData?.id,
        title,
        category,
        estimatedDuration: parsedDuration,
        priority,
        startTime: start,
        endTime: end,
        description,
      });
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to save target.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-slate-200">
        <div className="p-6 md:p-8 space-y-6">
           <DialogHeader>
             <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                {initialData ? "Edit Plan" : "Plan a Target"}
             </DialogTitle>
           </DialogHeader>

           {errorMsg && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium">
                 {errorMsg}
              </div>
           )}

           <div className="space-y-4">
              <div>
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 block">What do you want to accomplish?</label>
                 <Input 
                   autoFocus
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="text-xl py-6 bg-slate-50 border-transparent focus:border-orange-500 transition-colors"
                   placeholder="e.g. Study Linux Permissions"
                 />
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Duration (min)</label>
                    <Input 
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-11 bg-slate-50 border-transparent focus:border-orange-500 font-medium"
                    />
                 </div>
              </div>

              {!showAdvanced && (
                 <button 
                   onClick={() => setShowAdvanced(true)}
                   className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                 >
                    + Add Time, Priority, or Notes
                 </button>
              )}

              {showAdvanced && (
                 <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
                          <select
                            className="w-full h-11 px-3 rounded-lg bg-slate-50 border-transparent focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium transition-colors"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="Learn">Learn</option>
                            <option value="Build">Build</option>
                            <option value="Work">Work</option>
                            <option value="Practice">Practice</option>
                            <option value="Personal">Personal</option>
                          </select>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Scheduling</label>
                       <div className="flex gap-2">
                          {["ANYTIME", "SPECIFIC", "RANGE"].map((mode) => (
                             <Button 
                               key={mode}
                               variant={timeMode === mode ? "default" : "outline"}
                               onClick={() => setTimeMode(mode as "ANYTIME" | "SPECIFIC" | "RANGE")}
                               size="sm"
                               className={timeMode === mode ? "bg-slate-900 text-white" : "text-slate-500"}
                             >
                                {mode === "ANYTIME" ? "Anytime" : mode === "SPECIFIC" ? "Specific Time" : "Time Range"}
                             </Button>
                          ))}
                       </div>
                       
                       {timeMode !== "ANYTIME" && (
                          <div className="flex items-center gap-3 pt-2">
                             <Input 
                               type="time" 
                               value={startTimeStr} 
                               onChange={(e) => setStartTimeStr(e.target.value)} 
                               className="w-32 bg-slate-50"
                             />
                             {timeMode === "RANGE" && (
                                <>
                                  <span className="text-slate-400">to</span>
                                  <Input 
                                    type="time" 
                                    value={endTimeStr} 
                                    onChange={(e) => setEndTimeStr(e.target.value)} 
                                    className="w-32 bg-slate-50"
                                  />
                                </>
                             )}
                          </div>
                       )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
                          <select
                            className="w-full h-11 px-3 rounded-lg bg-slate-50 border-transparent focus:border-orange-500 text-sm font-medium transition-colors"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High (Important)</option>
                          </select>
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Notes</label>
                       <Textarea 
                         value={description}
                         onChange={(e) => setDescription(e.target.value)}
                         placeholder="Optional context for this target..."
                         className="bg-slate-50 border-transparent focus:border-orange-500 min-h-[80px] resize-none"
                       />
                    </div>
                 </div>
              )}
           </div>

           <DialogFooter className="pt-2">
             <Button variant="ghost" onClick={onClose} className="text-slate-500 rounded-full">Cancel</Button>
             <Button onClick={handleSave} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 shadow-md shadow-orange-500/20">
               {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Plan Target"}
             </Button>
           </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
