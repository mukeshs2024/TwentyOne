"use server";

import { getClientDateBoundaries } from "@/lib/auth";
import { getRequireProfile as getProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateFocusTime, formatFocusTime } from "@/lib/analytics";

export async function getTodayReview() {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();

  return prisma.dailyReview.findFirst({
    where: {
      profileId: profile.id,
      reviewDate: {
        gte: start,
        lte: end,
      },
    },
  });
}

export async function submitDailyReview(data: {
  accomplishments: string;
  learnings: string;
  wentWell: string;
  wentWrong: string;
  improvements: string;
  rating: number;
}) {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();

  // check if exists
  const existing = await prisma.dailyReview.findFirst({
    where: {
      profileId: profile.id,
      reviewDate: {
        gte: start,
        lte: end,
      },
    },
  });

  if (existing) {
    throw new Error("Review already submitted for today");
  }

  await prisma.dailyReview.create({
    data: {
      profileId: profile.id,
      reviewDate: start,
      accomplishments: data.accomplishments,
      learnings: data.learnings,
      wentWell: data.wentWell,
      wentWrong: data.wentWrong,
      improvements: data.improvements,
      rating: data.rating,
    },
  });

  revalidatePath("/today");
  revalidatePath("/review");
  
  return { success: true };
}

export async function getDailySummary() {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();
  
  const targets = await prisma.dailyTarget.findMany({
    where: {
      profileId: profile.id,
      targetDate: { gte: start, lte: end },
    },
    include: {
      sessions: true,
    }
  });


  
  const review = await prisma.dailyReview.findFirst({
    where: { profileId: profile.id, reviewDate: { gte: start, lte: end } }
  });

  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.status === 'COMPLETED').length;
  const partialTargets = targets.filter(t => t.status === 'PARTIAL').length;
  
  const totalFocusMinutes = calculateFocusTime(targets);
  const { hours: focusHours, mins: focusMins } = formatFocusTime(totalFocusMinutes);
  
  const score = Math.round(
    (completedTargets / (totalTargets || 1) * 50) +
    (Math.min(totalFocusMinutes / 120, 1) * 35) +
    ((review?.rating || 0) / 5 * 15)
  );

  return {
    score,
    totalTargets,
    completedTargets,
    partialTargets,
    focusHours,
    focusMins,

    rating: review?.rating || 0,
    review
  };
}
