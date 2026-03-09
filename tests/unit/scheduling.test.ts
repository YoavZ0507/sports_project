import { describe, expect, it } from "vitest";
import { validateSchedule } from "@/lib/scheduling";

describe("validateSchedule", () => {
  it("requires dueDate for one-time tasks", () => {
    expect(validateSchedule({ scheduleType: "one_time" }).valid).toBe(false);
    expect(validateSchedule({ scheduleType: "one_time", dueDate: "2026-03-10" }).valid).toBe(true);
  });

  it("requires recurrence rule for recurring tasks", () => {
    expect(validateSchedule({ scheduleType: "recurring" }).valid).toBe(false);
    expect(validateSchedule({ scheduleType: "recurring", recurrenceRule: "FREQ=WEEKLY;BYDAY=MO" }).valid).toBe(true);
  });
});
