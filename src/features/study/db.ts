import Dexie, { type EntityTable } from "dexie";

import type { AppearanceSettings, StudySession, Subject } from "./types";

class StudyThermalDatabase extends Dexie {
  subjects!: EntityTable<Subject, "id">;
  sessions!: EntityTable<StudySession, "id">;
  settings!: EntityTable<AppearanceSettings, "id">;

  constructor() {
    super("study-thermal");
    this.version(1).stores({
      subjects: "id, createdAt",
      sessions: "++id, subjectId, startedAt, endedAt",
      settings: "id",
    });
  }
}

export const db = new StudyThermalDatabase();

export const defaultSubjects: Subject[] = [
  { id: "study", name: "My first subject", color: "#8b8cf8", dailyGoalMinutes: 60, createdAt: "2026-01-01T00:00:00.000Z" },
];

export const defaultAppearance: AppearanceSettings = {
  id: "appearance",
  accent: "#8b8cf8",
  backgroundKind: "gradient",
  backgroundValue: "linear-gradient(145deg, #11131a 0%, #181525 48%, #0d1117 100%)",
  brightness: 72,
  blur: 0,
  overlay: 42,
};

export async function initializeDatabase(): Promise<void> {
  if ((await db.subjects.count()) === 0) await db.subjects.bulkAdd(defaultSubjects);
  if (!(await db.settings.get("appearance"))) await db.settings.add(defaultAppearance);
}
