"use server";

import { prisma } from "@/lib/prisma";
import { getRequireProfile as getProfile } from "@/lib/auth";

export type TimelineEvent = {
  id: string;
  type: 'FOCUS' | 'TARGET_COMPLETED';
  time: string; // ISO string
  title: string;
  subtitle?: string;
};

export type TargetSummary = {
  id: string;
  title: string;
  category: string;
  plannedDuration: number;
  actualDuration: number;
  status: string;
};

export type DayRecord = {
  date: string; // YYYY-MM-DD
  intensity: 0 | 1 | 2 | 3;
  stats: {
    totalTargets: number;
    completedTargets: number;
    plannedMins: number;
    actualMins: number;
  };
  targets: TargetSummary[];
  timeline: TimelineEvent[];
};

export async function getHistoryTimeline(startDate: Date, endDate: Date): Promise<DayRecord[]> {
  const profile = await getProfile();

  // Fetch all relevant data within the range
  const targets = await prisma.dailyTarget.findMany({
    where: { profileId: profile.id, targetDate: { gte: startDate, lte: endDate } },
    include: { sessions: true }
  });



  // Group by YYYY-MM-DD
  const daysMap = new Map<string, DayRecord>();

  const getOrCreateDay = (dateStr: string): DayRecord => {
    if (!daysMap.has(dateStr)) {
      daysMap.set(dateStr, {
        date: dateStr,
        intensity: 0,
        stats: { totalTargets: 0, completedTargets: 0, plannedMins: 0, actualMins: 0 },
        targets: [],
        timeline: []
      });
    }
    return daysMap.get(dateStr)!;
  };

  // Process Targets and Focus
  targets.forEach(t => {
    const dateStr = t.targetDate.toISOString().split("T")[0];
    const day = getOrCreateDay(dateStr);
    
    day.stats.totalTargets += 1;
    day.stats.plannedMins += t.estimatedDuration;
    
    let targetActualMins = 0;
    
    if (t.status === 'COMPLETED') {
       day.stats.completedTargets += 1;
       day.timeline.push({
          id: `tgt-${t.id}`,
          type: 'TARGET_COMPLETED',
          time: t.updatedAt.toISOString(),
          title: t.title,
          subtitle: 'Completed'
       });
    }

    t.sessions.forEach(s => {
       if (s.duration && s.duration > 0) {
          const sDay = getOrCreateDay(dateStr); // Use parent target's dateStr!
          sDay.stats.actualMins += s.duration;
          targetActualMins += s.duration;
          
          sDay.timeline.push({
             id: `sess-${s.id}`,
             type: 'FOCUS',
             time: s.createdAt.toISOString(),
             title: t.title,
             subtitle: `${s.duration}m focus`
          });
       }
    });

    day.targets.push({
       id: t.id,
       title: t.title,
       category: t.category,
       plannedDuration: t.estimatedDuration,
       actualDuration: targetActualMins,
       status: t.status
    });
  });

  // Calculate Intensities & Sort timelines
  const finalRecords = Array.from(daysMap.values());
  finalRecords.forEach(day => {
     day.timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // Descending time
     
     const { completedTargets, totalTargets, plannedMins, actualMins } = day.stats;
     
     let intensity: 0|1|2|3 = 0;
     
     if (totalTargets === 0 && actualMins === 0) {
        intensity = 0;
     } else if (completedTargets === totalTargets && totalTargets > 0) {
        intensity = 3; // 100% completed
     } else if (actualMins >= plannedMins && plannedMins > 0) {
        intensity = 3; // Strong execution
     } else if (actualMins > 0 || completedTargets > 0) {
        intensity = 2; // Partial execution
     } else if (totalTargets > 0) {
        intensity = 1; // Low activity / planned but nothing done
     }
     
     day.intensity = intensity;
  });

  // Return sorted days descending
  return finalRecords.sort((a, b) => b.date.localeCompare(a.date));
}
