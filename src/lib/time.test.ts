import assert from "node:assert/strict";
import test from "node:test";

import { completionForDay, formatDuration } from "./time.ts";

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
