"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minimize2, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Subject } from "@/features/study/types";
import { formatDuration } from "@/lib/time";
import { useTimer } from "@/features/timer/use-timer";

export function FocusMode({ subjects }: { subjects: Subject[] }) {
  const timer = useTimer();
  const subject = subjects.find((item) => item.id === timer.subjectId);
  return (
    <AnimatePresence>
      {timer.focusMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 px-6 backdrop-blur-2xl">
          <button className="absolute right-6 top-6 rounded-xl p-3 text-muted hover:bg-white/10 hover:text-ink" onClick={() => timer.setFocusMode(false)} aria-label="Exit focus mode"><Minimize2 size={19} /></button>
          <p className="mb-5 text-sm font-medium text-muted">{subject?.name ?? "Focus"}</p>
          <div className="timer-digits text-[clamp(4rem,13vw,11rem)] font-medium tracking-[-0.075em] text-ink">{formatDuration(timer.displaySeconds)}</div>
          <Button className="mt-12 min-w-32" variant="primary" onClick={timer.status === "running" ? () => void timer.pause() : timer.start}>{timer.status === "running" ? <><Pause size={17} /> Pause</> : <><Play size={17} /> {timer.status === "paused" ? "Resume" : "Start"}</>}</Button>
          <p className="absolute bottom-7 text-xs text-muted">Esc to exit · Space to pause</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
