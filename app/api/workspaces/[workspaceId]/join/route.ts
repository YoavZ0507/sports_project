import { getSessionFromHeaders } from "@/lib/auth";
import { failure, success, withApiError } from "@/lib/api";
import { requestToJoinWorkspace } from "@/lib/services/workspaceService";

export async function POST(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  return withApiError(async () => {
    const { workspaceId } = await params;
    const session = await getSessionFromHeaders();

    if (session.role !== "athlete") {
      return failure("only athletes can request to join", 403);
    }

    const membership = requestToJoinWorkspace({ workspaceId, athleteId: session.userId });
    return success(membership, 201);
  });
}
