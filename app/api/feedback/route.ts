import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { addCoachFeedback, listFeedback } from "@/lib/services/progressService";

const schema = z.object({
  updateId: z.string().min(1),
  comment: z.string().min(1)
});

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = schema.parse(await request.json());

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
  return withApiError(() => {
    const { searchParams } = new URL(request.url);
    return success(listFeedback(searchParams.get("updateId") ?? ""));
  });
}
