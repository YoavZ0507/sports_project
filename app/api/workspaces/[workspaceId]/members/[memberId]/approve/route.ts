import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { approveAthlete } from "@/lib/services/workspaceService";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { workspaceId, memberId } = await params;

    const member = approveAthlete({
      workspaceId,
      memberId,
      actorId: session.userId,
      actorRole: session.role
    });

    return success(member);
  });
}
