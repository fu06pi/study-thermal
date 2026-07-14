import { db } from "@/features/study/db";
import type { BackupData } from "@/features/study/types";

export async function exportBackup(): Promise<void> {
  const settings = await db.settings.get("appearance");
  if (!settings) throw new Error("Appearance settings are missing");
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects: await db.subjects.toArray(),
    sessions: await db.sessions.toArray(),
    settings,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `study-thermal-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function isBackup(value: unknown): value is BackupData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.version === 1 && Array.isArray(record.subjects) && Array.isArray(record.sessions)
    && Boolean(record.settings) && typeof record.settings === "object";
}

export async function importBackup(file: File): Promise<void> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!isBackup(parsed)) throw new Error("This is not a Study Thermal v1 backup");
  await db.transaction("rw", db.subjects, db.sessions, db.settings, async () => {
    await Promise.all([db.subjects.clear(), db.sessions.clear(), db.settings.clear()]);
    await db.subjects.bulkAdd(parsed.subjects);
    await db.sessions.bulkAdd(parsed.sessions.map((session) => ({
      subjectId: session.subjectId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationSeconds: session.durationSeconds,
    })));
    await db.settings.add(parsed.settings);
  });
}
