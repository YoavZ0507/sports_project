import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { listProgress, submitProgress } from "@/lib/services/progressService";

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
  return withApiError(() => {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId") ?? "";
    return success(listProgress(assignmentId));
  });
}
