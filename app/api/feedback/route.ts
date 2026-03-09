import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { addCoachFeedback, listFeedback } from "@/lib/services/progressService";

const schema = z.object({
  updateId: z.string().min(1),
  comment: z.string().min(1)
});

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = schema.parse(await request.json());
    const update = repository.getProgressUpdate(body.updateId);
    if (!update) {
      throw new Error("update not found");
    }

    const assignment = repository.getAssignment(update.assignmentId);
    const task = assignment ? repository.getTask(assignment.taskId) : undefined;
    const workspace = task ? repository.getWorkspace(task.workspaceId) : undefined;
    if (!workspace || session.role !== "coach" || workspace.coachId !== session.userId) {
      throw new Error("unauthorized");
    }

    return success(
      addCoachFeedback({
        actorRole: session.role,
        coachId: session.userId,
        updateId: body.updateId,
        comment: body.comment
      }),
      201
    );
  });
}

export async function GET(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { searchParams } = new URL(request.url);
    const updateId = searchParams.get("updateId") ?? "";
    const update = repository.getProgressUpdate(updateId);
    if (!update) {
      throw new Error("update not found");
    }

    const assignment = repository.getAssignment(update.assignmentId);
    const task = assignment ? repository.getTask(assignment.taskId) : undefined;
    const workspace = task ? repository.getWorkspace(task.workspaceId) : undefined;
    if (!workspace) {
      throw new Error("unauthorized");
    }

    if (session.role === "coach" && workspace.coachId !== session.userId) {
      throw new Error("unauthorized");
    }

    if (session.role === "athlete" && assignment?.athleteId !== session.userId) {
      throw new Error("unauthorized");
    }

    return success(listFeedback(updateId));
  });
}
