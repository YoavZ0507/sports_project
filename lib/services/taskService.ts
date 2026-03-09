import { createId } from "@/lib/ids";
import { requireCoach } from "@/lib/permissions";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { validateSchedule } from "@/lib/scheduling";
import type { AssignmentStatus, Task, TaskAssignment } from "@/lib/types";

export function createTask(input: {
  actorRole: "coach" | "athlete";
  actorId: string;
  workspaceId: string;
  title: string;
  description: string;
  scheduleType: Task["scheduleType"];
  dueDate?: string;
  recurrenceRule?: string;
}): Task {
  requireCoach(input.actorRole);
  const schedule = validateSchedule(input);
  if (!schedule.valid) throw new Error(schedule.reason);

  const task: Task = {
    id: createId("task"),
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    scheduleType: input.scheduleType,
    dueDate: input.dueDate,
    recurrenceRule: input.recurrenceRule,
    archived: false,
    createdBy: input.actorId,
    createdAt: new Date().toISOString()
  };

  return repository.createTask(task);
}

export function assignTask(input: {
  actorRole: "coach" | "athlete";
  taskId: string;
  athleteIds: string[];
}): TaskAssignment[] {
  requireCoach(input.actorRole);

  return input.athleteIds.map((athleteId) =>
    repository.createTaskAssignment({
      id: createId("assign"),
      taskId: input.taskId,
      athleteId,
      status: "not_started",
      assignedAt: new Date().toISOString()
    })
  );
}

export function updateTask(taskId: string, input: { actorRole: "coach" | "athlete"; archived?: boolean }): Task {
  requireCoach(input.actorRole);
  const updated = repository.updateTask(taskId, { archived: input.archived });
  if (!updated) throw new Error("task not found");
  return updated;
}

export function listAthleteTasks(workspaceId: string, athleteId: string): Array<{ task: Task; assignment: TaskAssignment }> {
  return repository.listAssignmentsForAthlete(workspaceId, athleteId);
}

export function moveAssignmentStatus(assignmentId: string, status: AssignmentStatus): TaskAssignment {
  const completedAt = status === "completed" ? new Date().toISOString() : undefined;
  const updated = repository.updateAssignment(assignmentId, { status, completedAt });
  if (!updated) throw new Error("assignment not found");
  return updated;
}
