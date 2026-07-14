"use client";

import { useEffect } from "react";
import { Maximize2, Pause, Play, RotateCcw, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Subject } from "@/features/study/types";
import { formatDuration } from "@/lib/time";
import { useTimer } from "./use-timer";

export function TimerCard({ subjects }: { subjects: Subject[] }) {
  const timer = useTimer();
  const { selectSubject, subjectId } = timer;
  useEffect(() => {
    if (subjects.length && !subjects.some((subject) => subject.id === subjectId)) {
      selectSubject(subjects[0].id);
    }
  }, [selectSubject, subjectId, subjects]);

  return (
    <section className="panel flex min-h-[340px] flex-col justify-between p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <select
          aria-label="Current subject"
          className="rounded-lg bg-transparent text-sm font-medium text-ink outline-none"
          disabled={!subjects.length}
          value={timer.subjectId}
          onChange={(event) => timer.selectSubject(event.target.value)}
        >
          {!subjects.length && <option>Add a subject in settings</option>}
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <button
          className="rounded-lg p-2 text-muted transition hover:bg-white/10 hover:text-ink"
          aria-label="Enter focus mode"
          onClick={() => timer.setFocusMode(true)}
        >
          <Maximize2 size={17} />
        </button>
      </div>

      <div className="py-8 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted">
          {timer.mode === "stopwatch" ? "Deep work" : "Focus countdown"}
        </p>
        <div className="timer-digits text-6xl font-medium tracking-[-0.07em] text-ink sm:text-7xl lg:text-[5.5rem]">
          {formatDuration(timer.displaySeconds)}
        </div>
        {timer.mode === "countdown" && timer.status === "idle" && (
          <div className="mt-6 flex justify-center gap-2">
            {[25, 45, 60].map((minutes) => (
              <button
                key={minutes}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${timer.countdownSeconds === minutes * 60 ? "bg-accent/20 text-ink" : "text-muted hover:bg-white/5"}`}
                onClick={() => timer.setCountdown(minutes * 60)}
              >
                {minutes}m
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {timer.status === "running" ? (
          <Button variant="primary" onClick={() => void timer.pause()}><Pause size={16} /> Pause</Button>
        ) : (
          <Button variant="primary" disabled={!subjects.length} onClick={timer.start}><Play size={16} /> {timer.status === "paused" ? "Resume" : "Start"}</Button>
        )}
        <Button onClick={() => void timer.reset()}><RotateCcw size={16} /> Reset</Button>
        <Button
          variant="ghost"
          onClick={() => timer.setMode(timer.mode === "stopwatch" ? "countdown" : "stopwatch")}
        >
          <TimerReset size={16} /> {timer.mode === "stopwatch" ? "Countdown" : "Stopwatch"}
        </Button>
      </div>
    </section>
  );
}
