import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TimerMode, TimerStatus } from "@/features/study/types";

interface TimerState {
  subjectId: string;
  mode: TimerMode;
  status: TimerStatus;
  elapsedSeconds: number;
  savedSeconds: number;
  countdownSeconds: number;
  startedAt: number | null;
  focusMode: boolean;
  selectSubject: (id: string) => void;
  start: () => void;
  pause: (elapsedSeconds: number) => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
  setCountdown: (seconds: number) => void;
  markSaved: (seconds: number) => void;
  setFocusMode: (enabled: boolean) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      subjectId: "statistics",
      mode: "stopwatch",
      status: "idle",
      elapsedSeconds: 0,
      savedSeconds: 0,
      countdownSeconds: 25 * 60,
      startedAt: null,
      focusMode: false,
      selectSubject: (subjectId) => set({ subjectId }),
      start: () => set({ status: "running", startedAt: Date.now() }),
      pause: (elapsedSeconds) => set({ status: "paused", elapsedSeconds, startedAt: null }),
      reset: () => set({ status: "idle", elapsedSeconds: 0, savedSeconds: 0, startedAt: null }),
      setMode: (mode) => set({ mode, status: "idle", elapsedSeconds: 0, savedSeconds: 0, startedAt: null }),
      setCountdown: (countdownSeconds) => set({ countdownSeconds }),
      markSaved: (savedSeconds) => set({ savedSeconds }),
      setFocusMode: (focusMode) => set({ focusMode }),
    }),
    { name: "study-thermal-timer" },
  ),
);
