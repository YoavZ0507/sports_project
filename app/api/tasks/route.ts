import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { assignTask, createTask, updateTask } from "@/lib/services/taskService";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { isCoachInWorkspace } from "@/lib/workspaceAccess";

const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(1),
  detailedInstructions: z.string().optional(),
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["video", "text", "file"]),
      url: z.string().min(1),
      mimeType: z.string().optional(),
      textPreview: z.string().optional()
    })
  ).default([]),
  scheduleType: z.enum(["one_time", "recurring"]),
  dueDate: z.string().optional(),
  recurrenceRule: z.string().optional(),
  athleteIds: z.array(z.string()).default([])
});

const patchSchema = z.object({
  taskId: z.string().min(1),
  archived: z.boolean()
});

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = createTaskSchema.parse(await request.json());
    const workspace = repository.getWorkspace(body.workspaceId);
    if (!workspace) {
      throw new Error("workspace not found");
    }

    if (session.role !== "coach" || !isCoachInWorkspace(body.workspaceId, session.userId)) {
      throw new Error("unauthorized");
    }

    const task = createTask({
      actorRole: session.role,
      actorId: session.userId,
      workspaceId: body.workspaceId,
      title: body.title,
      description: body.description,
      detailedInstructions: body.detailedInstructions,
      resources: body.resources,
      scheduleType: body.scheduleType,
      dueDate: body.dueDate,
      recurrenceRule: body.recurrenceRule
    });

    const assignments = body.athleteIds.length > 0
      ? assignTask({ actorRole: session.role, taskId: task.id, athleteIds: body.athleteIds })
      : [];

    return success({ task, assignments }, 201);
  });
}

export async function PATCH(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = patchSchema.parse(await request.json());
    const existingTask = repository.getTask(body.taskId);
    if (!existingTask) {
      throw new Error("task not found");
    }

    const workspace = repository.getWorkspace(existingTask.workspaceId);
    if (!workspace || session.role !== "coach" || !isCoachInWorkspace(existingTask.workspaceId, session.userId)) {
      throw new Error("unauthorized");
    }
    return success(updateTask(body.taskId, { actorRole: session.role, archived: body.archived }));
  });
}

export async function GET(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") ?? "";
    const athleteIdParam = searchParams.get("athleteId");
    const workspace = repository.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error("workspace not found");
    }

    if (session.role === "coach") {
      if (!isCoachInWorkspace(workspaceId, session.userId)) {
        throw new Error("unauthorized");
      }
      if (athleteIdParam) {
        return success(repository.listAssignmentsForAthlete(workspaceId, athleteIdParam));
      }
      return success(repository.listTasks(workspaceId));
    }

    const membership = repository.getWorkspaceMembership(workspaceId, session.userId);
    if (!membership || membership.role !== "athlete") {
      throw new Error("unauthorized");
    }

    return success(repository.listAssignmentsForAthlete(workspaceId, session.userId));
  });
}
