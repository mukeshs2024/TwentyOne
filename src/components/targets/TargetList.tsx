"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createTarget, updateTargetStatus, updateTargetDetails, deleteTarget, duplicateTarget, setNextTarget, updateTargetOrder } from "@/app/(app)/today/actions";
import { CheckCircle2, Circle, Plus, Target as TargetIcon, XCircle, AlertCircle, PlayCircle, MoreHorizontal, Edit2, Copy, Trash2, ArrowUp, ArrowDown, Play } from "lucide-react";
import TargetPlannerModal, { TargetData } from "./TargetPlannerModal";
import DayCapacityWidget from "./DayCapacityWidget";

type Target = {
  id: string;
  title: string;
  category: string;
  status: string;
  estimatedDuration: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  startTime?: Date | null;
  endTime?: Date | null;
  description?: string | null;
  sessions?: { duration: number | null }[];
  isNext?: boolean;
  executionOrder?: number;
};

export default function TargetList({ initialTargets, availableMinutes }: { initialTargets: Target[], availableMinutes?: number | null }) {
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetData | null>(null);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleStatus = async (target: Target) => {
    const newStatus = target.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await updateTargetStatus(target.id, newStatus as "PENDING" | "COMPLETED");
  };

  const handleMarkSkipped = async (target: Target) => {
    await updateTargetStatus(target.id, "SKIPPED");
    setOpenMenuId(null);
  };

  const handleSaveTarget = async (data: TargetData) => {
    if (data.id) {
       await updateTargetDetails(data.id, {
          title: data.title,
          category: data.category,
          estimatedDuration: data.estimatedDuration,
          priority: data.priority,
          startTime: data.startTime || undefined,
          endTime: data.endTime || undefined,
          description: data.description,
       });
    } else {
       await createTarget({
          title: data.title,
          category: data.category,
          estimatedDuration: data.estimatedDuration,
          priority: data.priority,
          startTime: data.startTime || undefined,
          endTime: data.endTime || undefined,
          description: data.description,
       });
    }
  };

  const openEdit = (target: Target) => {
    setEditingTarget({
      id: target.id,
      title: target.title,
      category: target.category,
      estimatedDuration: target.estimatedDuration,
      priority: target.priority,
      startTime: target.startTime,
      endTime: target.endTime,
      description: target.description || undefined,
    });
    setIsPlannerOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this target?")) {
       await deleteTarget(id);
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateTarget(id);
    setOpenMenuId(null);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    // We only want to reorder active targets, so we extract their IDs
    const activeIds = initialTargets
      .filter(t => t.status !== "COMPLETED" && t.status !== "SKIPPED" && t.status !== "MISSED")
      .map(t => t.id);
      
    if (activeIds.length < 2) return;
    
    // Find the target's current position in the active list
    const targetId = sortedTargets[index].id;
    const activeIndex = activeIds.indexOf(targetId);
    
    if (activeIndex === -1) return; // Cannot move a completed target
    if (direction === 'up' && activeIndex === 0) return;
    if (direction === 'down' && activeIndex === activeIds.length - 1) return;
    
    // Swap
    const swapIndex = direction === 'up' ? activeIndex - 1 : activeIndex + 1;
    const temp = activeIds[activeIndex];
    activeIds[activeIndex] = activeIds[swapIndex];
    activeIds[swapIndex] = temp;
    
    // Also include completed targets at the end to maintain their IDs
    const completedIds = initialTargets
      .filter(t => t.status === "COMPLETED" || t.status === "SKIPPED" || t.status === "MISSED")
      .map(t => t.id);
      
    await updateTargetOrder([...activeIds, ...completedIds]);
    setOpenMenuId(null);
  };

  // Sort: active targets first (preserving DB order), then completed targets
  const sortedTargets = [...initialTargets].sort((a, b) => {
     const isAComplete = a.status === "COMPLETED" || a.status === "SKIPPED" || a.status === "MISSED";
     const isBComplete = b.status === "COMPLETED" || b.status === "SKIPPED" || b.status === "MISSED";
     if (isAComplete && !isBComplete) return 1;
     if (!isAComplete && isBComplete) return -1;
     return 0;
  });

  const getStatusIcon = (status: string) => {
     switch (status) {
        case "COMPLETED": return <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}><CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" /></motion.div>;
        case "IN_PROGRESS": return <PlayCircle className="w-5 h-5 text-orange-500 fill-orange-100" />;
        case "PARTIAL": return <AlertCircle className="w-5 h-5 text-amber-500" />;
        case "SKIPPED": return <XCircle className="w-5 h-5 text-slate-300" />;
        case "MISSED": return <XCircle className="w-5 h-5 text-red-300" />;
        default: return <Circle className="w-5 h-5 text-slate-300 group-hover:text-orange-400 transition-colors" />;
     }
  };

  const getStatusRowClass = (target: Target) => {
     if (target.isNext) return "bg-orange-50/50 border-orange-100/50";
     switch (target.status) {
        case "COMPLETED": return "opacity-50";
        case "PARTIAL": return "opacity-80";
        case "SKIPPED": return "opacity-40 hidden";
        case "MISSED": return "opacity-40 hidden";
        default: return "hover:bg-slate-50 border-transparent";
     }
  };

  const getStatusTextClass = (status: string) => {
     switch (status) {
        case "COMPLETED": return "line-through text-slate-500";
        case "IN_PROGRESS": return "text-orange-900 font-bold";
        case "SKIPPED": return "line-through text-slate-400";
        case "MISSED": return "text-red-800 line-through";
        default: return "text-slate-900 font-semibold";
     }
  };

  const totalPlannedMinutes = initialTargets
     .filter(t => t.status !== "SKIPPED" && t.status !== "MISSED")
     .reduce((acc, t) => acc + t.estimatedDuration, 0);

  const formatTimeRange = (start?: Date | null, end?: Date | null) => {
     if (!start) return null;
     const s = new Date(start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
     if (!end) return s;
     const e = new Date(end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
     return `${s} - ${e}`;
  };

  return (
    <div className="space-y-6">
      
      {availableMinutes && (
         <DayCapacityWidget plannedMinutes={totalPlannedMinutes} availableMinutes={availableMinutes} />
      )}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Today&apos;s Plan
        </h2>
        <Button
          onClick={() => {
             setEditingTarget(null);
             setIsPlannerOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Plan Target
        </Button>
      </div>

      <div className="relative pb-10">
         <div className="absolute left-6 top-4 bottom-0 w-px bg-slate-200 z-0"></div>
         
         <motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="show"
            className="space-y-3 relative z-10" 
            ref={menuRef}
         >
            <AnimatePresence>
            {sortedTargets.length === 0 && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 ml-10">
                  <TargetIcon className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">Your plan is empty.</p>
                  <Button variant="link" onClick={() => { setEditingTarget(null); setIsPlannerOpen(true); }} className="text-orange-600 mt-2">
                     Plan your first target
                  </Button>
               </motion.div>
            )}
            
            {sortedTargets.map((target, index) => {
               const focusedMins = target.sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
               const isCompleteOrSkipped = target.status === "COMPLETED" || target.status === "SKIPPED" || target.status === "MISSED";
               return (
               <motion.div 
                  key={target.id} 
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  layout
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${getStatusRowClass(target)}`}
               >
                  <button onClick={() => handleToggleStatus(target)} className="mt-0.5 bg-white rounded-full flex-shrink-0 relative z-10 transition-transform active:scale-90 w-6 h-6 flex items-center justify-center">
                     {getStatusIcon(target.status)}
                  </button>
                  
                  <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-4 relative">
                     <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
                        <div className="flex flex-col">
                           <h3 className={`text-base truncate ${getStatusTextClass(target.status)}`}>
                              {target.title}
                              {target.priority === "HIGH" && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-slate-900" title="High Priority" />}
                           </h3>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block mt-0.5">{target.category}</span>
                        </div>
                        <div className="flex items-center gap-3 md:ml-auto">
                           <span className="text-sm font-medium text-slate-500">
                              {focusedMins > 0 ? (
                                 <span className="text-slate-900">{focusedMins}m <span className="text-slate-400">/ {target.estimatedDuration}m</span></span>
                              ) : (
                                 <span>{target.estimatedDuration}m</span>
                              )}
                           </span>
                           {target.startTime && (
                              <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">
                                 {formatTimeRange(target.startTime, target.endTime)}
                              </span>
                           )}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                           <Button onClick={() => setOpenMenuId(openMenuId === target.id ? null : target.id)} variant="ghost" size="sm" className="h-10 w-10 md:h-8 md:w-8 p-0 rounded-full text-slate-400 hover:bg-slate-200">
                             <MoreHorizontal className="w-5 h-5 md:w-4 md:h-4" />
                           </Button>
                           
                           {/* Inline Custom Dropdown Menu */}
                           {openMenuId === target.id && (
                              <div className="absolute right-0 top-12 md:top-10 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                 
                                 {/* Make Next Actions */}
                                 {!isCompleteOrSkipped && (
                                    <>
                                       {!target.isNext ? (
                                          <button onClick={() => { setNextTarget(target.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 flex items-center">
                                             <Play className="w-4 h-4 mr-2 fill-current" /> Make Next
                                          </button>
                                       ) : (
                                          <button onClick={() => { setNextTarget(null); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 md:py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 flex items-center">
                                             Remove Next Status
                                          </button>
                                       )}
                                       <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                    </>
                                 )}

                                 {/* Move Actions */}
                                 {!isCompleteOrSkipped && (
                                    <>
                                       <button onClick={() => handleMove(index, 'up')} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                                          <ArrowUp className="w-4 h-4 mr-2 text-slate-400" /> Move Up
                                       </button>
                                       <button onClick={() => handleMove(index, 'down')} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                                          <ArrowDown className="w-4 h-4 mr-2 text-slate-400" /> Move Down
                                       </button>
                                       <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                    </>
                                 )}

                                 <button onClick={() => openEdit(target)} className="w-full text-left px-4 py-3 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                                    <Edit2 className="w-4 h-4 mr-2 text-slate-400" /> Edit Target
                                 </button>
                                 <button onClick={() => handleDuplicate(target.id)} className="w-full text-left px-4 py-3 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                                    <Copy className="w-4 h-4 mr-2 text-slate-400" /> Duplicate
                                 </button>
                                 {!isCompleteOrSkipped && (
                                    <button onClick={() => handleMarkSkipped(target)} className="w-full text-left px-4 py-3 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                                       <XCircle className="w-4 h-4 mr-2 text-slate-400" /> Skip
                                    </button>
                                 )}
                                 <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                 <button onClick={() => handleDelete(target.id)} className="w-full text-left px-4 py-3 md:py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center">
                                    <Trash2 className="w-4 h-4 mr-2 text-red-400" /> Delete
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )})}
            </AnimatePresence>
         </motion.div>
      </div>

      <TargetPlannerModal 
         isOpen={isPlannerOpen} 
         onClose={() => setIsPlannerOpen(false)} 
         onSave={handleSaveTarget}
         initialData={editingTarget}
      />
    </div>
  );
}
