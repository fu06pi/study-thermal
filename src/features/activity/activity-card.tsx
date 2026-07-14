"use client";

import { useMemo, useState } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";

import type { HeatmapRange, StudySession, Subject } from "@/features/study/types";
import { completionForDay, formatDuration, getDateRange } from "@/lib/time";

const rangeDays: Record<HeatmapRange, number> = { week: 7, month: 35, year: 365 };

export function ActivityCard({ subjects, sessions }: { subjects: Subject[]; sessions: StudySession[] }) {
  const [range, setRange] = useState<HeatmapRange>("year");
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));
  const data = useMemo<Activity[]>(() => getDateRange(rangeDays[range]).map((date) => {
    const completion = completionForDay(date, sessions, subjects);
    return {
      date,
      count: completion.percentage,
      level: Math.min(4, Math.ceil(completion.percentage / 25)) as Activity["level"],
    };
  }), [range, sessions, subjects]);

  const tooltip = (activity: Activity): string => {
    const completion = completionForDay(activity.date, sessions, subjects);
    const names = completion.subjectIds.map((id) => subjectNames.get(id)).filter(Boolean).join(", ");
    return `${activity.date} · ${formatDuration(completion.seconds)} · ${completion.percentage}%${names ? ` · ${names}` : ""}`;
  };

  return (
    <section className="panel overflow-hidden p-6 sm:p-7">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Consistency</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Study activity</h2>
        </div>
        <div className="flex rounded-xl bg-black/20 p-1" aria-label="Activity range">
          {(["week", "month", "year"] as HeatmapRange[]).map((item) => (
            <button
              key={item}
              className={`rounded-lg px-3 py-1.5 text-xs capitalize transition ${range === item ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}
              onClick={() => setRange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="activity-scroll overflow-x-auto pb-2">
        <ActivityCalendar
          data={data}
          blockMargin={4}
          blockRadius={3}
          blockSize={range === "year" ? 11 : 15}
          colorScheme="dark"
          fontSize={11}
          maxLevel={4}
          showColorLegend
          showMonthLabels={range !== "week"}
          showTotalCount={false}
          showWeekdayLabels={range !== "week"}
          theme={{ dark: ["#252733", "#343754", "#505486", "#6f72ba", "var(--accent-hex)"] }}
          renderBlock={(block, activity) => (
            <g>
              {block}
              <title>{tooltip(activity)}</title>
            </g>
          )}
        />
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">Intensity reflects completion against each studied subject&apos;s daily goal.</p>
    </section>
  );
}
