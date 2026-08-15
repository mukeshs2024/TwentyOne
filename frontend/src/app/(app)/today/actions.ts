"use server";

import { getClientDateBoundaries } from "@/lib/auth";
import { getRequireProfile as getProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateDailyProgress, calculateFocusTime, formatFocusTime } from "@/lib/analytics";

export async function getTodayTargets() {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();

  const targets = await prisma.dailyTarget.findMany({
    where: {
      profileId: profile.id,
      targetDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      sessions: true,
    },
    orderBy: [
      { executionOrder: 'asc' },
      { createdAt: 'asc' },
    ]
  });

  return targets;
}

export async function createTarget(data: {
  title: string;
  category: string;
  estimatedDuration: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  startTime?: Date;
  endTime?: Date;
  description?: string;
}) {
  const profile = await getProfile();
  const { start } = await getClientDateBoundaries();

  const target = await prisma.dailyTarget.create({
    data: {
      profileId: profile.id,
      title: data.title,
      category: data.category,
      estimatedDuration: data.estimatedDuration,
      targetDate: start,
      priority: data.priority || "MEDIUM",
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
    },
  });

  revalidatePath("/today");
  return target;
}

export async function updateTargetDetails(id: string, data: {
  title: string;
  category: string;
  estimatedDuration: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  startTime?: Date;
  endTime?: Date;
  description?: string;
}) {
  const profile = await getProfile();

  const existing = await prisma.dailyTarget.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");

  const target = await prisma.dailyTarget.update({
    where: { id },
    data,
  });

  revalidatePath("/today");
  return target;
}

export async function deleteTarget(id: string) {
  const profile = await getProfile();
  
  const existing = await prisma.dailyTarget.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");
  
  await prisma.dailyTarget.delete({
    where: { id }
  });

  revalidatePath("/today");
}

export async function duplicateTarget(id: string) {
  const profile = await getProfile();
  
  const existing = await prisma.dailyTarget.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");

  const target = await prisma.dailyTarget.create({
    data: {
      profileId: existing.profileId,
      title: `${existing.title} (Copy)`,
      category: existing.category,
      estimatedDuration: existing.estimatedDuration,
      targetDate: existing.targetDate,
      priority: existing.priority,
      description: existing.description,
    }
  });

  revalidatePath("/today");
  return target;
}

export async function updateTargetStatus(id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED') {
  const profile = await getProfile();
  
  const existing = await prisma.dailyTarget.findUnique({ where: { id } });
  if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");
  
  const target = await prisma.dailyTarget.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/today");
  return target;
}

export async function logTargetSession(
  targetId: string, 
  startTime: Date,
  endTime: Date,
  durationMinutes: number, 
  finalStatus?: "COMPLETED" | "PARTIAL"
) {
  const profile = await getProfile();

  const existing = await prisma.dailyTarget.findUnique({ where: { id: targetId } });
  if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");

  await prisma.targetSession.create({
    data: {
      targetId,
      startTime,
      endTime,
      duration: durationMinutes,
    },
  });

  if (finalStatus) {
     await prisma.dailyTarget.update({
        where: { id: targetId },
        data: { 
          status: finalStatus,
          isNext: finalStatus === "COMPLETED" ? false : undefined
        },
     });
  }

  // NOTE: If learning integration is active in the future, we will update the topic's LearningRecord here.

  revalidatePath("/today");
}

export async function setNextTarget(targetId: string | null) {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();

  // First, clear isNext for all of today's targets
  await prisma.dailyTarget.updateMany({
    where: {
      profileId: profile.id,
      targetDate: { gte: start, lte: end },
    },
    data: { isNext: false }
  });

  // Then, set isNext for the chosen target
  if (targetId) {
    const existing = await prisma.dailyTarget.findUnique({ where: { id: targetId } });
    if (!existing || existing.profileId !== profile.id) throw new Error("Unauthorized");

    await prisma.dailyTarget.update({
      where: { id: targetId },
      data: { isNext: true }
    });
  }

  revalidatePath("/today");
}

export async function updateTargetOrder(orderedIds: string[]) {
  const profile = await getProfile();

  // Update execution order sequentially based on array position
  const promises = orderedIds.map((id, index) => 
    prisma.dailyTarget.updateMany({
      where: { id, profileId: profile.id },
      data: { executionOrder: index }
    })
  );

  await Promise.all(promises);
  revalidatePath("/today");
}

export async function getDashboardStats() {
  const profile = await getProfile();
  const { start, end } = await getClientDateBoundaries();

  // Get targets
  const targets = await prisma.dailyTarget.findMany({
    where: {
      profileId: profile.id,
      targetDate: { gte: start, lte: end },
    },
    include: {
      sessions: true,
    }
  });

  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.status === 'COMPLETED').length;
  
  const progress = calculateDailyProgress(targets);
  const totalFocusMinutes = calculateFocusTime(targets);
  const { hours: focusHours, mins: focusMins } = formatFocusTime(totalFocusMinutes);

  return {
    progress,
    focusHours,
    focusMins,
    completedTargets,
    totalTargets
  };
}
