"use server";

import { prisma } from "@/lib/prisma";
import { getRequireProfile as getProfile } from "@/lib/auth";
import { addDays, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getActiveChallenge() {
  const profile = await getProfile();

  return await prisma.challenge.findFirst({
    where: { 
      profileId: profile.id,
      status: "ACTIVE"
    },
    include: {
      days: {
        orderBy: { dayNumber: 'asc' }
      }
    }
  });
}

export async function startChallenge(formData: FormData) {
  const profile = await getProfile();
  
  const title = formData.get("title") as string;
  const goal = formData.get("goal") as string;
  
  if (!title) {
    throw new Error("Title is required");
  }

  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 20); // 21 days total (0 to 20)

  const challenge = await prisma.challenge.create({
    data: {
      profileId: profile.id,
      title,
      goal,
      startDate,
      endDate,
      status: "ACTIVE"
    }
  });

  // Pre-generate the 21 days
  const daysToCreate = Array.from({ length: 21 }).map((_, i) => ({
    challengeId: challenge.id,
    dayNumber: i + 1,
    date: addDays(startDate, i),
    status: "MISSED" as const, // default to missed until they log it
  }));

  await prisma.challengeDay.createMany({
    data: daysToCreate
  });

  revalidatePath("/journey");
}

export async function logChallengeDay(dayId: string, status: "SUCCESS" | "PARTIAL" | "MISSED") {
  const profile = await getProfile();
  
  const existing = await prisma.challengeDay.findUnique({ 
    where: { id: dayId },
    include: { challenge: true }
  });
  if (!existing || existing.challenge.profileId !== profile.id) throw new Error("Unauthorized");

  await prisma.challengeDay.update({
    where: { id: dayId },
    data: { status }
  });
  
  revalidatePath("/journey");
}
