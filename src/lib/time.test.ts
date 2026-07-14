import assert from "node:assert/strict";
import test from "node:test";

import { hexToHsv, hsvToHex } from "./color.ts";
import { completionForDay, formatDuration, getWeekDates, hourlyDistributionForDay } from "./time.ts";

test("formats time and caps completion at 100 percent", () => {
  assert.equal(formatDuration(5565), "01:32:45");
  const result = completionForDay(
    "2026-07-14",
    [{ subjectId: "math", startedAt: "2026-07-14T10:00:00", endedAt: "2026-07-14T12:00:00", durationSeconds: 7200 }],
    [{ id: "math", name: "Math", color: "#fff", dailyGoalMinutes: 60, createdAt: "2026-01-01" }],
  );
  assert.equal(result.percentage, 100);
  assert.equal(result.seconds, 7200);
});

test("splits sessions across hours and returns a Monday-first week", () => {
  const hourly = hourlyDistributionForDay("2026-07-14", [
    { subjectId: "math", startedAt: "2026-07-14T10:30:00", endedAt: "2026-07-14T11:30:00", durationSeconds: 3600 },
  ]);
  assert.equal(hourly[10], 1800);
  assert.equal(hourly[11], 1800);
  assert.deepEqual(getWeekDates(new Date("2026-07-14T12:00:00")), [
    "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19",
  ]);
});

test("round-trips hex colors through HSV", () => {
  assert.equal(hsvToHex(hexToHsv("#55c6a9")), "#55c6a9");
  assert.equal(hsvToHex({ hue: 240, saturation: 1, value: 1 }), "#0000ff");
});
