import { TargetStatus, DailyTarget, TargetSession } from '@twentyone/backend';

export type TargetWithSessions = DailyTarget & {
  sessions: TargetSession[];
};

/**
 * Calculates the daily progress percentage.
 * Formula: (completed targets) / (total targets) * 100
 */
export function calculateDailyProgress(targets: DailyTarget[]): number {
  if (!targets || targets.length === 0) return 0;

  const completedTargets = targets.filter(t => t.status === TargetStatus.COMPLETED).length;
  
  // The denominator is all targets planned for the day (including skipped, missed, pending, etc.)
  const totalTargets = targets.length;
  
  return Math.min(Math.round((completedTargets / totalTargets) * 100), 100);
}

/**
 * Calculates total focus time in minutes from target sessions.
 * This aggregates the actual duration of all sessions.
 */
export function calculateFocusTime(targets: TargetWithSessions[]): number {
  let totalMinutes = 0;
  
  for (const target of targets) {
    if (target.sessions) {
      for (const session of target.sessions) {
        if (session.duration) {
          totalMinutes += session.duration;
        } else if (session.endTime && session.startTime) {
          const durationMs = session.endTime.getTime() - session.startTime.getTime();
          totalMinutes += Math.floor(durationMs / 60000);
        }
      }
    }
  }
  
  return totalMinutes;
}

/**
 * Formats minutes into hours and minutes objects.
 */
export function formatFocusTime(totalMinutes: number): { hours: number, mins: number } {
  return {
    hours: Math.floor(totalMinutes / 60),
    mins: totalMinutes % 60
  };
}
