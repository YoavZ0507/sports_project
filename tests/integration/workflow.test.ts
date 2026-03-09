import { beforeEach, describe, expect, it } from "vitest";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { createWorkspace, requestToJoinWorkspace, approveAthlete } from "@/lib/services/workspaceService";
import { createTask, assignTask } from "@/lib/services/taskService";
import { submitProgress, addCoachFeedback, listFeedback } from "@/lib/services/progressService";
import { getDashboard } from "@/lib/services/dashboardService";

beforeEach(() => {
  repository.reset();
  repository.upsertUser({ id: "coach", email: "coach@test", fullName: "Coach", locale: "en" });
  repository.upsertUser({ id: "athlete", email: "athlete@test", fullName: "Athlete", locale: "he" });
});

describe("coach-athlete integration flow", () => {
  it("handles join request, approval, task completion and feedback", () => {
    const workspace = createWorkspace({ coachId: "coach", coachRole: "coach", name: "Elite Team" });
    const pending = requestToJoinWorkspace({ workspaceId: workspace.id, athleteId: "athlete" });
    const approved = approveAthlete({
      workspaceId: workspace.id,
      memberId: pending.id,
      actorId: "coach",
      actorRole: "coach"
    });

    expect(approved.role).toBe("athlete");

    const task = createTask({
      actorRole: "coach",
      actorId: "coach",
      workspaceId: workspace.id,
      title: "Tempo",
      description: "20 min tempo",
      scheduleType: "one_time",
      dueDate: "2026-03-09"
    });

    const [assignment] = assignTask({ actorRole: "coach", taskId: task.id, athleteIds: ["athlete"] });
    const progress = submitProgress({
      actorRole: "athlete",
      actorId: "athlete",
      assignmentId: assignment.id,
      status: "completed",
      note: "Done",
      metrics: [{ metricKey: "rpe", metricValue: 7 }]
    });

    addCoachFeedback({ actorRole: "coach", coachId: "coach", updateId: progress.id, comment: "Strong effort" });

    const feedback = listFeedback(progress.id);
    expect(feedback).toHaveLength(1);

    const dashboard = getDashboard(workspace.id);
    expect(dashboard.completionRate).toBe(100);
  });

  it("counts overdue non-completed assignments", () => {
    const workspace = createWorkspace({ coachId: "coach", coachRole: "coach", name: "Overdue Team" });
    const pending = requestToJoinWorkspace({ workspaceId: workspace.id, athleteId: "athlete" });
    approveAthlete({ workspaceId: workspace.id, memberId: pending.id, actorId: "coach", actorRole: "coach" });

    const task = createTask({
      actorRole: "coach",
      actorId: "coach",
      workspaceId: workspace.id,
      title: "Old task",
      description: "Old",
      scheduleType: "one_time",
      dueDate: "2020-01-01"
    });

    assignTask({ actorRole: "coach", taskId: task.id, athleteIds: ["athlete"] });
    const dashboard = getDashboard(workspace.id);
    expect(dashboard.overdueCount).toBe(1);
  });
});
