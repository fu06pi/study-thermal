"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { db } from "@/features/study/db";
import { useTimerStore } from "./store";

function sendCompletionNotification(): void {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Study session complete", { body: "Your focus block has been saved." });
  }
}

export function useTimer() {
  const timer = useTimerStore();
  const [now, setNow] = useState(Date.now());

  const elapsedSeconds = useMemo(() => {
    if (timer.status !== "running" || timer.startedAt === null) return timer.elapsedSeconds;
    return timer.elapsedSeconds + Math.floor((now - timer.startedAt) / 1000);
  }, [now, timer.elapsedSeconds, timer.startedAt, timer.status]);

  const displaySeconds = timer.mode === "countdown"
    ? Math.max(0, timer.countdownSeconds - elapsedSeconds)
    : elapsedSeconds;

  const saveUnsaved = useCallback(async (totalSeconds: number) => {
    const durationSeconds = totalSeconds - timer.savedSeconds;
    if (durationSeconds < 1) return;
    const endedAt = new Date();
    await db.sessions.add({
      subjectId: timer.subjectId,
      startedAt: new Date(endedAt.getTime() - durationSeconds * 1000).toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds,
    });
    timer.markSaved(totalSeconds);
  }, [timer]);

  const pause = useCallback(async () => {
    timer.pause(elapsedSeconds);
    await saveUnsaved(elapsedSeconds);
  }, [elapsedSeconds, saveUnsaved, timer]);

  const reset = useCallback(async () => {
    await saveUnsaved(elapsedSeconds);
    timer.reset();
  }, [elapsedSeconds, saveUnsaved, timer]);

  useEffect(() => {
    if (timer.status !== "running") return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timer.status]);

  useEffect(() => {
    if (timer.mode !== "countdown" || timer.status !== "running" || displaySeconds > 0) return;
    void pause().then(sendCompletionNotification);
  }, [displaySeconds, pause, timer.mode, timer.status]);

  return { ...timer, elapsedSeconds, displaySeconds, pause, reset };
}
