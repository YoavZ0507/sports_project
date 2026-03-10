import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { listProgress, submitProgress } from "@/lib/services/progressService";
import { isCoachInWorkspace } from "@/lib/workspaceAccess";

const schema = z.object({
  assignmentId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed", "blocked"]),
  note: z.string().min(1),
  metrics: z.array(
    z.object({
      metricKey: z.string().min(1),
      metricValue: z.number(),
      unit: z.string().optional()
    })
  ).default([])
});

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = schema.parse(await request.json());
    const assignment = repository.getAssignment(body.assignmentId);
    if (!assignment) {
      throw new Error("assignment not found");
    }

    if (session.role !== "athlete" || assignment.athleteId !== session.userId) {
      throw new Error("unauthorized");
    }

    return success(
      submitProgress({
        actorRole: session.role,
        actorId: session.userId,
        assignmentId: body.assignmentId,
        status: body.status,
        note: body.note,
        metrics: body.metrics
      }),
      201
    );
  });
}

export async function GET(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId") ?? "";
    const assignment = repository.getAssignment(assignmentId);
    if (!assignment) {
      throw new Error("assignment not found");
    }

    if (session.role === "athlete" && assignment.athleteId !== session.userId) {
      throw new Error("unauthorized");
    }

    if (session.role === "coach") {
      const task = repository.getTask(assignment.taskId);
      const workspace = task ? repository.getWorkspace(task.workspaceId) : undefined;
      if (!workspace || !isCoachInWorkspace(workspace.id, session.userId)) {
        throw new Error("unauthorized");
      }
    }

    return success(listProgress(assignmentId));
  });
}
