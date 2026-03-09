import { z } from "zod";
import { createId } from "@/lib/ids";
import { requireAthlete, requireCoach } from "@/lib/permissions";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { moveAssignmentStatus } from "@/lib/services/taskService";
import type { CoachFeedback, ProgressUpdate } from "@/lib/types";

export const metricSchema = z.object({
  metricKey: z.string().min(1),
  metricValue: z.number(),
  unit: z.string().optional()
});

const updateSchema = z.object({
  assignmentId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  note: z.string().min(1),
  metrics: z.array(metricSchema).default([])
});

export function submitProgress(input: {
  actorRole: "coach" | "athlete";
  actorId: string;
  assignmentId: string;
  status: ProgressUpdate["status"];
  note: string;
  metrics: Array<{ metricKey: string; metricValue: number; unit?: string }>;
}): ProgressUpdate {
  requireAthlete(input.actorRole);
  const parsed = updateSchema.parse(input);

  moveAssignmentStatus(parsed.assignmentId, parsed.status);

  const update: ProgressUpdate = {
    id: createId("update"),
    assignmentId: parsed.assignmentId,
    status: parsed.status,
    note: parsed.note,
    submittedAt: new Date().toISOString(),
    createdBy: input.actorId,
    metrics: parsed.metrics.map((metric) => ({
      id: createId("metric"),
      updateId: "",
      metricKey: metric.metricKey,
      metricValue: metric.metricValue,
      unit: metric.unit
    }))
  };

  update.metrics = update.metrics.map((metric) => ({ ...metric, updateId: update.id }));
  return repository.createProgressUpdate(update);
}

export function listProgress(assignmentId: string): ProgressUpdate[] {
  return repository.listProgressForAssignment(assignmentId);
}

export function addCoachFeedback(input: {
  actorRole: "coach" | "athlete";
  coachId: string;
  updateId: string;
  comment: string;
}): CoachFeedback {
  requireCoach(input.actorRole);
  const update = repository.getProgressUpdate(input.updateId);
  if (!update) throw new Error("update not found");

  return repository.createFeedback({
    id: createId("feedback"),
    updateId: input.updateId,
    coachId: input.coachId,
    comment: input.comment,
    visibility: "athlete",
    createdAt: new Date().toISOString()
  });
}

export function listFeedback(updateId: string): CoachFeedback[] {
  return repository.listFeedbackByUpdate(updateId);
}
