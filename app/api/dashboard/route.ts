import { success, withApiError } from "@/lib/api";
import { getDashboard } from "@/lib/services/dashboardService";

export async function GET(request: Request) {
  return withApiError(() => {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") ?? "";
    return success(getDashboard(workspaceId));
  });
}
