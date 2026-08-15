"use server";

import { prisma } from "@/lib/prisma";
import { getRequireProfile as getProfile, getClientDateBoundaries } from "@/lib/auth";
import { subDays, format, startOfDay } from "date-fns";



export async function getInsightsData(days: 7 | 21 | 30 | 90 = 30) {
  const profile = await getProfile();

  const { start: todayStart } = await getClientDateBoundaries();
  const currentPeriodStart = startOfDay(subDays(todayStart, days - 1));
  const previousPeriodStart = startOfDay(subDays(todayStart, (days * 2) - 1));

  // Fetch Current Period Data
  const targets = await prisma.dailyTarget.findMany({
    where: { profileId: profile.id, targetDate: { gte: currentPeriodStart } },
    include: { sessions: true },
  });



  const skips = await prisma.skipRecord.findMany({
    where: { target: { profileId: profile.id, targetDate: { gte: currentPeriodStart } } },
    include: { target: true }
  });

  // Fetch Previous Period Data for Growth
  const prevTargets = await prisma.dailyTarget.findMany({
    where: { profileId: profile.id, targetDate: { gte: previousPeriodStart, lt: currentPeriodStart } },
    include: { sessions: true },
  });
  


  const { calculateFocusTime } = await import("@/lib/analytics");

  // 1. TOP SUMMARY METRICS
  const totalFocusMins = calculateFocusTime(targets);
  const totalPlannedMins = targets.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);
  
  const completedTargets = targets.filter(t => t.status === 'COMPLETED').length;
  const partialTargets = targets.filter(t => t.status === 'PARTIAL').length;
  const skippedTargets = skips.length;
  const executionRate = totalPlannedMins > 0 ? Math.round((totalFocusMins / totalPlannedMins) * 100) : 0;
  
  const uniqueDaysWithFocus = new Set(targets.filter(t => calculateFocusTime([t]) > 0).map(t => format(t.targetDate, "yyyy-MM-dd"))).size;
  
  const totalSessions = targets.reduce((acc, t) => acc + t.sessions.length, 0);
  const averageFocusSession = totalSessions > 0 ? Math.round(totalFocusMins / totalSessions) : 0;
  const planningAccuracy = totalPlannedMins > 0 ? 100 - Math.min(100, Math.round(Math.abs(totalFocusMins - totalPlannedMins) / totalPlannedMins * 100)) : 0;

  const summary = {
    focusHours: Math.floor(totalFocusMins / 60),
    focusMins: Math.round(totalFocusMins % 60),
    executionRate,
    completedTargets,
    partialTargets,
    skippedTargets,
    totalTargets: targets.length,
    activeDays: uniqueDaysWithFocus,
    plannedMins: totalPlannedMins,
    actualMins: totalFocusMins,
    averageFocusSession,
    planningAccuracy
  };

  // 2. CHART AGGREGATIONS
  const executionChartData = [];
  const timeChartData = [];
  
  // Initialize chronological array for the charts
  for (let i = days - 1; i >= 0; i--) {
     const d = startOfDay(subDays(todayStart, i));
     const dateStr = format(d, "MMM dd");
     const isoStr = format(d, "yyyy-MM-dd");

     const daysTargets = targets.filter(t => format(t.targetDate, "yyyy-MM-dd") === isoStr);
     const completed = daysTargets.filter(t => t.status === 'COMPLETED').length;
     const plannedMins = daysTargets.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);
     const actualMins = calculateFocusTime(daysTargets);

     executionChartData.push({
        date: dateStr,
        completed,
        total: daysTargets.length,
        skipped: skips.filter(s => format(s.target.targetDate, "yyyy-MM-dd") === isoStr).length
     });

     timeChartData.push({
        date: dateStr,
        planned: Math.round(plannedMins / 60 * 10) / 10,
        actual: Math.round(actualMins / 60 * 10) / 10
     });
  }

  // 3. LEARNING AGGREGATIONS


  // 4. GROWTH COMPARISON
  const prevFocusMins = calculateFocusTime(prevTargets);
  const prevPlannedMins = prevTargets.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);
  const prevExecutionRate = prevPlannedMins > 0 ? Math.round((prevFocusMins / prevPlannedMins) * 100) : 0;

  const growth = {
     focus: {
        current: Math.round(totalFocusMins / 60),
        previous: Math.round(prevFocusMins / 60)
     },
     execution: {
        current: executionRate,
        previous: prevExecutionRate
     }
  };

  // 5. PATTERNS ENGINE
  const patterns: string[] = [];
  
  if (targets.length >= 10) {
     const diffMins = totalFocusMins - totalPlannedMins;
     if (diffMins > 120) {
        patterns.push(`You consistently work longer than you plan (+${Math.round(diffMins/60)}h). Consider increasing your time estimates.`);
     } else if (diffMins < -120) {
        patterns.push(`You often fall short of your planned hours (${Math.round(diffMins/60)}h). Try scheduling fewer intensive targets.`);
     }

     const skipsByReason: Record<string, number> = {};
     skips.forEach(s => {
        skipsByReason[s.reason] = (skipsByReason[s.reason] || 0) + 1;
     });
     
     if (skips.length > 3) {
        const topReason = Object.keys(skipsByReason).reduce((a, b) => skipsByReason[a] > skipsByReason[b] ? a : b);
        const readableReasons: Record<string, string> = {
          NO_TIME: "lack of time", TOO_TIRED: "fatigue", TOO_DIFFICULT: "difficulty",
          LOST_FOCUS: "losing focus", UNEXPECTED_WORK: "unexpected work", NO_LONGER_RELEVANT: "irrelevance"
        };
        patterns.push(`Your most common roadblock is ${readableReasons[topReason] || "other distractions"}.`);
     }

     if (executionRate > 80) {
        patterns.push("Your execution rate is excellent. You are consistently focusing for the time you set out to do.");
     }
  }

  if (patterns.length === 0) {
     patterns.push("Execute for a few more days to unlock personalized behavioral patterns.");
  }

  return {
     summary,
     executionChartData,
     timeChartData,
     growth,
     patterns
  };
}
