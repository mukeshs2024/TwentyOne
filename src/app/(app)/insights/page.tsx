import InsightsClient from "./InsightsClient";
import { getInsightsData } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { days } = await searchParams;
  const daysNum = days ? parseInt(days, 10) : 30;
  
  // ensure it is one of our strict range values
  const validDays = [7, 21, 30, 90].includes(daysNum) ? daysNum as 7|21|30|90 : 30;

  const data = await getInsightsData(validDays);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <InsightsClient data={data} currentDays={validDays} />
    </div>
  );
}
