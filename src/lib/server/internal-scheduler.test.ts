import { describe, expect, test } from "bun:test";
import { millisecondsUntilUtcHour } from "./internal-scheduler";

describe("millisecondsUntilUtcHour", () => {
  test("schedules the next UTC hour today", () => {
    const now = new Date("2026-09-10T10:30:00.000Z");

    expect(millisecondsUntilUtcHour(now, 11)).toBe(30 * 60 * 1000);
  });

  test("schedules tomorrow when the UTC hour has passed", () => {
    const now = new Date("2026-09-10T12:00:00.000Z");

    expect(millisecondsUntilUtcHour(now, 11)).toBe(23 * 60 * 60 * 1000);
  });
});
