import { beforeEach, describe, expect, it } from "vitest";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { createTask, assignTask } from "@/lib/services/taskService";
import { createWorkspace } from "@/lib/services/workspaceService";
import { submitProgress } from "@/lib/services/progressService";

beforeEach(() => {
  repository.reset();
  repository.upsertUser({ id: "coach", email: "coach@test", fullName: "Coach", locale: "en" });
  repository.upsertUser({ id: "athlete", email: "athlete@test", fullName: "Athlete", locale: "en" });
});

describe("progress updates", () => {
  it("accepts structured metrics and updates assignment status", () => {
    const ws = createWorkspace({ coachId: "coach", coachRole: "coach", name: "Team" });
    const task = createTask({
      actorRole: "coach",
      actorId: "coach",
      workspaceId: ws.id,
      title: "Intervals",
      description: "4 x 1km",
      scheduleType: "one_time",
      dueDate: "2026-03-12"
    });

    const [assignment] = assignTask({ actorRole: "coach", taskId: task.id, athleteIds: ["athlete"] });
    const update = submitProgress({
      actorRole: "athlete",
      actorId: "athlete",
      assignmentId: assignment.id,
      status: "completed",
      note: "Completed all reps",
      metrics: [{ metricKey: "avg_pace", metricValue: 3.5, unit: "min/km" }]
    });

    expect(update.metrics).toHaveLength(1);
    expect(repository.getAssignment(assignment.id)?.status).toBe("completed");
  });

  it("rejects coach attempting athlete update", () => {
    expect(() =>
      submitProgress({
        actorRole: "coach",
        actorId: "coach",
        assignmentId: "any",
        status: "completed",
        note: "x",
        metrics: []
      })
    ).toThrow("forbidden");
  });
});
