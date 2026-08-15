"use server";

import { prisma } from "@/lib/prisma";
import { getRequireProfile as getProfile } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string; availableTime?: number }) {
   const profile = await getProfile();
   
   await prisma.profile.update({
      where: { id: profile.id },
      data: {
         name: data.name ?? profile.name,
         availableTime: data.availableTime ?? profile.availableTime,
      }
   });
   
   revalidatePath("/settings");
   return { success: true };
}

export async function deleteAccount() {
   const profile = await getProfile();
   const supabase = await createClient();
   
   // In a real app with Supabase Auth, you would delete the auth user via Admin API
   // Here we just delete the database profile, which cascades to all targets, reviews, etc.
   await prisma.profile.delete({
      where: { id: profile.id }
   });
   
   await supabase.auth.signOut();
   return { success: true };
}

export async function exportData() {
   const profile = await getProfile();
   
   const data = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: {
         dailyTargets: {
            include: { sessions: true, skipRecord: true }
         },

         dailyReviews: true,
         challenges: {
            include: { days: true }
         },
         userAchievements: {
            include: { achievement: true }
         }
      }
   });
   
   return JSON.stringify(data);
}
