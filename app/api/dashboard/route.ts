import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getDashboard } from "@/lib/services/dashboardService";
import { isCoachInWorkspace } from "@/lib/workspaceAccess";

export async function GET(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") ?? "";
    const workspace = repository.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error("workspace not found");
    }

    if (session.role === "coach" && !isCoachInWorkspace(workspaceId, session.userId)) {
      throw new Error("unauthorized");
    }

    if (session.role === "athlete") {
      const membership = repository.getWorkspaceMembership(workspaceId, session.userId);
      if (!membership || membership.role !== "athlete") {
        throw new Error("unauthorized");
      }
    }

    return success(getDashboard(workspaceId));
  });
}
