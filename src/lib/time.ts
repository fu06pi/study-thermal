import type { StudySession, Subject } from "@/features/study/types";

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function localDateKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function completionForDay(
  date: string,
  sessions: StudySession[],
  subjects: Subject[],
): { seconds: number; percentage: number; subjectIds: string[] } {
  const daySessions = sessions.filter((session) => localDateKey(session.startedAt) === date);
  const secondsBySubject = new Map<string, number>();
  for (const session of daySessions) {
    secondsBySubject.set(
      session.subjectId,
      (secondsBySubject.get(session.subjectId) ?? 0) + session.durationSeconds,
    );
  }
  const subjectIds = [...secondsBySubject.keys()];
  const goals = subjects.filter((subject) => secondsBySubject.has(subject.id));
  const ratio = goals.length
    ? goals.reduce((total, subject) => {
        const studied = secondsBySubject.get(subject.id) ?? 0;
        return total + Math.min(studied / (subject.dailyGoalMinutes * 60), 1);
      }, 0) / goals.length
    : 0;
  return {
    seconds: daySessions.reduce((total, session) => total + session.durationSeconds, 0),
    percentage: Math.round(ratio * 100),
    subjectIds,
  };
}

export function getDateRange(days: number, end = new Date()): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - index - 1));
    return localDateKey(date);
  });
}
