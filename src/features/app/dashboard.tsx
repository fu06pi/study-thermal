"use client";

import { useState, type CSSProperties } from "react";
import { Bell, Leaf, Settings } from "lucide-react";

import { ActivityCard } from "@/features/activity/activity-card";
import { FocusMode } from "@/features/focus/focus-mode";
import { Background } from "@/features/settings/background";
import { SettingsPanel } from "@/features/settings/settings-panel";
import { StatisticsCard } from "@/features/statistics/statistics-card";
import { useStudyData } from "@/features/study/use-study-data";
import { TaskList } from "@/features/tasks/task-list";
import { TimerCard } from "@/features/timer/timer-card";
import { useAppEffects } from "./use-app-effects";

function hexToRgb(hex: string): string {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255} ${(number >> 8) & 255} ${number & 255}`;
}

export function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { subjects, sessions, appearance } = useStudyData();
  useAppEffects(subjects, sessions);
  const style: CSSProperties & Record<"--accent" | "--accent-hex", string> = {
    "--accent": hexToRgb(appearance.accent),
    "--accent-hex": appearance.accent,
  };

  return (
    <div style={style} className="min-h-screen text-ink">
      <Background settings={appearance} />
      <header className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-accent"><Leaf size={17} /></span>
          <div><h1 className="text-sm font-semibold tracking-tight">Study Thermal</h1><p className="text-[10px] uppercase tracking-[0.16em] text-muted">Quiet consistency</p></div>
        </div>
        <nav className="flex items-center gap-1">
          <button className="header-button" aria-label="Enable notifications" onClick={() => typeof Notification !== "undefined" && void Notification.requestPermission()}><Bell size={17} /></button>
          <button className="header-button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><Settings size={17} /></button>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-[1480px] gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[minmax(430px,0.88fr)_minmax(560px,1.35fr)] lg:px-10">
        <div className="min-w-0 space-y-5"><TimerCard subjects={subjects} /><TaskList subjects={subjects} sessions={sessions} onManage={() => setSettingsOpen(true)} /></div>
        <div className="min-w-0 space-y-5"><ActivityCard subjects={subjects} sessions={sessions} /><StatisticsCard subjects={subjects} sessions={sessions} /></div>
      </main>

      <FocusMode subjects={subjects} />
      {settingsOpen && <SettingsPanel settings={appearance} subjects={subjects} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
