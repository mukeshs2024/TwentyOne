"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { startOfDay } from "date-fns";

export async function completeOnboarding(data: {
  availableTime: number;
  focusAreas: string[];
  firstTargetTitle: string;
  firstTargetCategory: string;
  firstTargetEstimatedMins: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Create Profile and First Target in a single transaction
  await prisma.$transaction(async (tx) => {
    // 1. Create Profile (name is omitted for friction-free onboarding)
    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        availableTime: data.availableTime,
        focusAreas: data.focusAreas,
      },
    });

    // 2. Create today's first DailyTarget so the dashboard isn't empty
    const today = startOfDay(new Date());
    await tx.dailyTarget.create({
      data: {
        profileId: profile.id,
        title: data.firstTargetTitle,
        category: data.firstTargetCategory || (data.focusAreas.length > 0 ? data.focusAreas[0] : "General"),
        estimatedDuration: data.firstTargetEstimatedMins,
        targetDate: today,
        status: "PENDING",
        priority: "HIGH", // Their very first target is inherently high priority
      },
    });
  });

  redirect("/today");
}
