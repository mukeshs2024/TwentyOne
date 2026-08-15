import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDayBoundaries } from "./date";

/**
 * Retrieves the currently authenticated user's profile from the database.
 * If the user is not authenticated or the profile does not exist, it will securely redirect to the onboarding or login flow.
 * Use this in Server Components and Server Actions to guarantee a valid profile.
 */
export async function getRequireProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }
  
  return profile;
}

/**
 * Gets the timezone-aware client date bounds passed via cookies.
 */
export async function getClientDateBoundaries() {
  const cookieStore = await cookies();
  const clientDate = cookieStore.get('client_date')?.value;
  return getDayBoundaries(clientDate);
}
