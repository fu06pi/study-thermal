"use client";

import { useMemo, useState } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";

import type { HeatmapRange, StudySession, Subject } from "@/features/study/types";
import {
  completionForDay,
  formatDuration,
  getDateRange,
  getWeekDates,
  hourlyDistributionForDay,
  localDateKey,
} from "@/lib/time";

const calendarDays = { month: 35, halfYear: 183, year: 365 } as const;
const activityColors = [
  "#252733",
  "color-mix(in srgb, var(--accent-hex) 25%, #252733)",
  "color-mix(in srgb, var(--accent-hex) 50%, #252733)",
  "color-mix(in srgb, var(--accent-hex) 75%, #252733)",
  "var(--accent-hex)",
];
const ranges: { value: HeatmapRange; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "halfYear", label: "6 Months" },
  { value: "year", label: "Year" },
];

export function ActivityCard({ subjects, sessions }: { subjects: Subject[]; sessions: StudySession[] }) {
  const [range, setRange] = useState<HeatmapRange>("year");
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));
  const data = useMemo<Activity[]>(() => {
    if (range === "day" || range === "week") return [];
    return getDateRange(calendarDays[range]).map((date) => {
      const completion = completionForDay(date, sessions, subjects);
      return {
        date,
        count: completion.percentage,
        level: Math.min(4, Math.ceil(completion.percentage / 25)) as Activity["level"],
      };
    });
  }, [range, sessions, subjects]);

  const tooltip = (activity: Activity): string => {
    const completion = completionForDay(activity.date, sessions, subjects);
    const names = completion.subjectIds.map((id) => subjectNames.get(id)).filter(Boolean).join(", ");
    return `${activity.date} · ${formatDuration(completion.seconds)} · ${completion.percentage}%${names ? ` · ${names}` : ""}`;
  };

  return (
    <section className="panel overflow-hidden p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Consistency</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Study activity</h2>
        </div>
        <div className="grid w-full grid-cols-5 rounded-xl bg-black/20 p-1 sm:flex sm:w-auto" aria-label="Activity range">
          {ranges.map((item) => (
            <button
              key={item.value}
              className={`min-w-0 rounded-lg px-1 py-1.5 text-[11px] transition sm:px-3 sm:text-xs ${range === item.value ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}
              onClick={() => setRange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {range === "day" && <DayDistribution sessions={sessions} />}
      {range === "week" && <WeekDistribution sessions={sessions} subjects={subjects} />}
      {range !== "day" && range !== "week" && (
        <CalendarDistribution range={range} data={data} tooltip={tooltip} />
      )}

      <p className="mt-5 text-xs leading-5 text-muted">
        {range === "day" ? "Hourly intensity reflects focused minutes within each hour." : "Daily intensity reflects completion against each studied subject's goal."}
      </p>
    </section>
  );
}

function DayDistribution({ sessions }: { sessions: StudySession[] }) {
  const today = localDateKey(new Date());
  const hours = hourlyDistributionForDay(today, sessions);
  const totalSeconds = hours.reduce((total, seconds) => total + seconds, 0);
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-xs text-muted">Today · {today}</span>
        <span className="text-sm font-medium text-ink">{formatDuration(totalSeconds)}</span>
      </div>
      <div className="grid grid-cols-12 gap-1.5 md:grid-cols-[repeat(24,minmax(0,1fr))]">
        {hours.map((seconds, hour) => {
          const intensity = Math.min(seconds / 3600, 1);
          return (
            <div key={hour} className="min-w-0">
              <div
                className="aspect-square rounded-[4px] border border-white/[0.04]"
                style={{ backgroundColor: intensity ? `rgb(var(--accent) / ${0.18 + intensity * 0.82})` : "#252733" }}
                title={`${String(hour).padStart(2, "0")}:00 · ${Math.round(seconds / 60)} min`}
              />
              <span className={`mt-2 block text-center text-[9px] text-muted ${hour % 3 ? "opacity-0" : ""}`}>{String(hour).padStart(2, "0")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekDistribution({ sessions, subjects }: { sessions: StudySession[]; subjects: Subject[] }) {
  const dates = getWeekDates();
  return (
    <div className="mobile-scroll overflow-x-auto pb-2">
      <div className="grid min-w-[620px] grid-cols-7 gap-2">
        {dates.map((date) => {
          const day = new Date(`${date}T12:00:00`);
          const completion = completionForDay(date, sessions, subjects);
          return (
            <div key={date} className="rounded-xl bg-white/[0.035] p-3 text-center" title={`${date} · ${formatDuration(completion.seconds)} · ${completion.percentage}%`}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{day.toLocaleDateString(undefined, { weekday: "short" })}</p>
              <p className="mt-1 text-xs text-ink">{date.slice(5)}</p>
              <div className="mx-auto mt-3 flex h-16 w-5 items-end overflow-hidden rounded-md bg-white/[0.06]">
                <div className="w-full rounded-md bg-accent transition-all" style={{ height: `${completion.percentage}%`, opacity: completion.percentage ? 0.9 : 0 }} />
              </div>
              <p className="mt-2 text-[10px] text-muted">{Math.round(completion.seconds / 60)}m</p>
              <p className="mt-0.5 text-xs font-medium text-ink">{completion.percentage}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarDistribution({ range, data, tooltip }: { range: "month" | "halfYear" | "year"; data: Activity[]; tooltip: (activity: Activity) => string }) {
  return (
    <>
      <div className="activity-scroll mobile-scroll overflow-x-auto pb-2">
        <ActivityCalendar
          data={data}
          blockMargin={4}
          blockRadius={3}
          blockSize={range === "year" ? 11 : range === "halfYear" ? 13 : 15}
          colorScheme="dark"
          fontSize={11}
          maxLevel={4}
          showColorLegend={false}
          showMonthLabels
          showTotalCount={false}
          showWeekdayLabels
          theme={{ dark: activityColors }}
          renderBlock={(block, activity) => <g>{block}<title>{tooltip(activity)}</title></g>}
        />
      </div>
      <div className="mt-3 flex max-w-full flex-wrap items-center justify-end gap-1.5 text-xs text-muted" aria-label="Activity intensity from less to more">
        <span className="mr-1">Less</span>
        {activityColors.map((color) => <span key={color} className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: color }} />)}
        <span className="ml-1">More</span>
      </div>
    </>
  );
}
