import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTodayTargets, getDashboardStats } from "./actions";
import TargetList from "@/components/targets/TargetList";
import NextUp from "@/components/timer/NextUp";
import { format } from "date-fns";


export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { getRequireProfile } = await import("@/lib/auth");
  const profile = await getRequireProfile();

  const targets = await getTodayTargets();
  const stats = await getDashboardStats();



  // Find the Next Up target explicitly chosen by the user
  const nextUpTargetId = targets.find(t => t.isNext === true)?.id || null;

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 sm:px-6 md:px-0">
      
      {/* HEADER */}
      <header className="mb-12 pt-8">
         <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
           {format(new Date(), "EEEE, MMMM d")}
         </h1>
         <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
           Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile.name?.split(' ')[0] || "User"}.
         </h2>
      </header>

      {/* TODAY'S STATUS */}
      <div className="mb-12 flex items-center gap-8">
         <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Available</p>
            <p className="font-bold text-slate-900 text-2xl">{profile.availableTime || 0} min</p>
         </div>
         <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Focused</p>
            <p className="font-bold text-slate-900 text-2xl">{stats.focusHours * 60 + stats.focusMins} min</p>
         </div>
      </div>

      <div className="space-y-16">
        {/* PRIMARY ACTION */}
        <div className="space-y-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stats.totalTargets === 0 ? "Today's Priority" : "Up Next"}</h3>
           <NextUp targets={targets} suggestedTargetId={nextUpTargetId || null} />
        </div>
        
        {/* TODAY TARGETS */}
        {stats.totalTargets > 0 && (
           <div className="space-y-4 pt-4 border-t border-slate-100">
              <TargetList initialTargets={targets} availableMinutes={profile.availableTime} />
           </div>
        )}

        {/* TODAY'S PROGRESS SUMMARY */}
        <div className="space-y-6 pt-16 border-t border-slate-100 pb-16">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today&apos;s Progress</h3>
           {stats.totalTargets === 0 && stats.focusHours === 0 && stats.focusMins === 0 ? (
             <p className="font-medium text-slate-400 text-lg leading-relaxed italic">
                Your execution record will appear here once you begin your day.
             </p>
           ) : (
             <p className="font-medium text-slate-600 text-lg leading-relaxed">
               {stats.focusHours > 0 || stats.focusMins > 0 ? `${stats.focusHours}h ${stats.focusMins}m Focus` : "No focus yet"} &nbsp;&nbsp;&middot;&nbsp;&nbsp; 
               {stats.totalTargets > 0 ? `${stats.completedTargets} / ${stats.totalTargets} Targets` : "0 Targets"}
             </p>
           )}
        </div>
      </div>
    </div>
  );
}
