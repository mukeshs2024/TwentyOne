import { getRequireProfile } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const profile = await getRequireProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <SettingsClient profile={profile} email={user.email || ""} />
    </div>
  );
}
