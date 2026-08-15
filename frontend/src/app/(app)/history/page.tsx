import { getHistoryTimeline } from "./actions";
import HistoryClient from "./HistoryClient";
import { createClient } from "@/utils/supabase/server";
import { getClientDateBoundaries } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { end: today } = await getClientDateBoundaries();
  
  // Fetch a rolling 90-day window by default for the calendar
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 90);
  startDate.setHours(0, 0, 0, 0);

  const timeline = await getHistoryTimeline(startDate, today);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <HistoryClient initialTimeline={timeline} />
    </div>
  );
}
