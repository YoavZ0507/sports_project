import type { ScheduleType } from "@/lib/types";

export function validateSchedule(input: {
  scheduleType: ScheduleType;
  dueDate?: string;
  recurrenceRule?: string;
}): { valid: boolean; reason?: string } {
  if (input.scheduleType === "one_time" && !input.dueDate) {
    return { valid: false, reason: "dueDate is required for one_time tasks" };
  }

  if (input.scheduleType === "recurring" && !input.recurrenceRule) {
    return { valid: false, reason: "recurrenceRule is required for recurring tasks" };
  }

  return { valid: true };
}
