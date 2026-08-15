import { getDailySummary } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReviewWizard from "./ReviewWizard";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const summary = await getDailySummary();

  return <ReviewWizard initialSummary={summary} />;
}
