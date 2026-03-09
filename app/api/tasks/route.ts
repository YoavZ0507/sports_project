import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { assignTask, createTask, updateTask } from "@/lib/services/taskService";
import { repository } from "@/lib/repositories/inMemoryRepository";

const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(1),
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

    const task = createTask({
      actorRole: session.role,
      actorId: session.userId,
      workspaceId: body.workspaceId,
      title: body.title,
      description: body.description,
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
    return success(updateTask(body.taskId, { actorRole: session.role, archived: body.archived }));
  });
}

export async function GET(request: Request) {
  return withApiError(async () => {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") ?? "";
    const athleteId = searchParams.get("athleteId");

    if (athleteId) {
      return success(repository.listAssignmentsForAthlete(workspaceId, athleteId));
    }

    return success(repository.listTasks(workspaceId));
  });
}
