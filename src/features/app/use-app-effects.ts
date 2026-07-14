"use client";

import { useEffect } from "react";

import type { StudySession, Subject } from "@/features/study/types";
import { useTimer } from "@/features/timer/use-timer";
import { basePath } from "@/lib/base-path";
import { localDateKey } from "@/lib/time";

export function useAppEffects(subjects: Subject[], sessions: StudySession[]): void {
  const timer = useTimer();

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register(`${basePath}/sw.js`);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, [contenteditable=true]")) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (timer.status === "running") void timer.pause();
        else timer.start();
      }
      if (event.key.toLowerCase() === "f") timer.setFocusMode(true);
      if (event.key === "Escape") timer.setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timer]);

  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const today = localDateKey(new Date());
    for (const subject of subjects) {
      const minutes = sessions
        .filter((session) => session.subjectId === subject.id && localDateKey(session.startedAt) === today)
        .reduce((sum, session) => sum + session.durationSeconds, 0) / 60;
      const key = `study-thermal-goal-${today}-${subject.id}`;
      if (minutes >= subject.dailyGoalMinutes && !localStorage.getItem(key)) {
        new Notification(`${subject.name} goal complete`, { body: `${subject.dailyGoalMinutes} focused minutes today.` });
        localStorage.setItem(key, "notified");
      }
    }
  }, [sessions, subjects]);
}
