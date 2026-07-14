"use client";

import { useMemo } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import type { StudySession, Subject } from "@/features/study/types";
import { getDateRange, localDateKey } from "@/lib/time";

export function StatisticsCard({ subjects, sessions }: { subjects: Subject[]; sessions: StudySession[] }) {
  const { trend, distribution, todayMinutes, weekMinutes, monthMinutes, averageMinutes, streak, longestStreak } = useMemo(() => {
    const lastSeven = getDateRange(7);
    const minutesFor = (date: string) => Math.round(sessions
      .filter((session) => localDateKey(session.startedAt) === date)
      .reduce((sum, session) => sum + session.durationSeconds, 0) / 60);
    const trendData = lastSeven.map((date) => ({ day: date.slice(5), minutes: minutesFor(date) }));
    const distributionData = subjects.map((subject) => ({
      name: subject.name,
      color: subject.color,
      value: Math.round(sessions
        .filter((session) => session.subjectId === subject.id)
        .reduce((sum, session) => sum + session.durationSeconds, 0) / 60),
    })).filter((item) => item.value > 0);
    const activeDates = new Set(sessions.map((session) => localDateKey(session.startedAt)));
    let currentStreak = 0;
    const cursor = new Date();
    while (activeDates.has(localDateKey(cursor))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const sortedDates = [...activeDates].sort();
    let longest = 0;
    let run = 0;
    sortedDates.forEach((date, index) => {
      const previous = index > 0 ? Date.parse(`${sortedDates[index - 1]}T00:00:00Z`) : null;
      const current = Date.parse(`${date}T00:00:00Z`);
      run = previous !== null && (current - previous) / 86_400_000 === 1 ? run + 1 : 1;
      longest = Math.max(longest, run);
    });
    const weekTotal = trendData.reduce((sum, item) => sum + item.minutes, 0);
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 29);
    const monthTotal = sessions.filter((session) => new Date(session.startedAt) >= monthStart)
      .reduce((sum, session) => sum + session.durationSeconds, 0) / 60;
    return {
      trend: trendData,
      distribution: distributionData,
      todayMinutes: minutesFor(localDateKey(new Date())),
      weekMinutes: weekTotal,
      monthMinutes: Math.round(monthTotal),
      averageMinutes: Math.round(weekTotal / 7),
      streak: currentStreak,
      longestStreak: longest,
    };
  }, [sessions, subjects]);

  return (
    <section className="panel p-6 sm:p-7">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">This week</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Your rhythm</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          ["Today", `${todayMinutes}m`],
          ["Week", `${Math.floor(weekMinutes / 60)}h ${weekMinutes % 60}m`],
          ["Month", `${Math.floor(monthMinutes / 60)}h ${monthMinutes % 60}m`],
          ["Average", `${averageMinutes}m`],
          ["Current streak", `${streak} days`],
          ["Longest streak", `${longestStreak} days`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/[0.035] p-3">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="studyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-hex)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent-hex)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#777987", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1c1e26", border: "1px solid #ffffff18", borderRadius: 10, fontSize: 12 }} />
            <Area type="monotone" dataKey="minutes" stroke="var(--accent-hex)" fill="url(#studyFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-5">
        <div className="h-24 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distribution.length ? distribution : [{ name: "No data", value: 1, color: "#292b35" }]} dataKey="value" innerRadius={27} outerRadius={43} paddingAngle={3} stroke="none">
                {(distribution.length ? distribution : [{ name: "No data", value: 1, color: "#292b35" }]).map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 space-y-2">
          {(distribution.length ? distribution.slice(0, 4) : [{ name: "No sessions yet", value: 0, color: "#555" }]).map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              <span className="truncate">{item.name}</span>
              {item.value > 0 && <span className="ml-auto text-ink">{item.value}m</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
