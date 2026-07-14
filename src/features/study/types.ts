export type TimerMode = "stopwatch" | "countdown";
export type TimerStatus = "idle" | "running" | "paused";
export type HeatmapRange = "week" | "month" | "year";
export type BackgroundKind = "gradient" | "image" | "video" | "lottie";

export interface Subject {
  id: string;
  name: string;
  color: string;
  dailyGoalMinutes: number;
  createdAt: string;
}

export interface StudySession {
  id?: number;
  subjectId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface AppearanceSettings {
  id: "appearance";
  accent: string;
  backgroundKind: BackgroundKind;
  backgroundValue: string;
  brightness: number;
  blur: number;
  overlay: number;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  subjects: Subject[];
  sessions: StudySession[];
  settings: AppearanceSettings;
}
