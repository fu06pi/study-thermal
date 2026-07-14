"use client";

import { CheckCircle2 } from "lucide-react";

import type { StudySession, Subject } from "@/features/study/types";
import { localDateKey } from "@/lib/time";
import { useTimerStore } from "@/features/timer/store";

export function TaskList({ subjects, sessions }: { subjects: Subject[]; sessions: StudySession[] }) {
  const selectedId = useTimerStore((state) => state.subjectId);
  const selectSubject = useTimerStore((state) => state.selectSubject);
  const today = localDateKey(new Date());

  return (
    <section className="panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Today&apos;s plan</h2>
          <p className="mt-1 text-xs text-muted">Choose a subject to begin</p>
        </div>
        <span className="text-xs text-muted">{subjects.length} subjects</span>
      </div>
      <div className="space-y-2">
        {subjects.map((subject) => {
          const completedMinutes = Math.floor(sessions
            .filter((session) => session.subjectId === subject.id && localDateKey(session.startedAt) === today)
            .reduce((total, session) => total + session.durationSeconds, 0) / 60);
          const percentage = Math.min((completedMinutes / subject.dailyGoalMinutes) * 100, 100);
          return (
            <button
              key={subject.id}
              className={`group w-full rounded-xl border p-4 text-left transition ${selectedId === subject.id ? "border-white/15 bg-white/[0.07]" : "border-transparent hover:bg-white/[0.04]"}`}
              onClick={() => selectSubject(subject.id)}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: subject.color }} />
                  {subject.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  {completedMinutes >= subject.dailyGoalMinutes && <CheckCircle2 size={13} className="text-accent" />}
                  {completedMinutes} / {subject.dailyGoalMinutes} min
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: subject.color }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
