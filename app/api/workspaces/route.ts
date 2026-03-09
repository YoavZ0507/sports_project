import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { failure, success, withApiError } from "@/lib/api";
import { createWorkspace } from "@/lib/services/workspaceService";
import { repository } from "@/lib/repositories/inMemoryRepository";

const schema = z.object({ name: z.string().min(2) });

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = schema.parse(await request.json());

    repository.upsertUser({
      id: session.userId,
      email: `${session.userId}@local.test`,
      fullName: session.userId,
      locale: session.locale
    });

    const workspace = createWorkspace({
      coachId: session.userId,
      coachRole: session.role,
      name: body.name
    });

    return success(workspace, 201);
  });
}

export async function GET() {
  return withApiError(() => success(repository.listWorkspaces()));
}
