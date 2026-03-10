import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { updateCalendarEvent } from "@/lib/services/calendarService";

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  eventType: z.enum(["training", "game", "special"]).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  location: z.string().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { eventId } = await params;
    const patch = patchSchema.parse(await request.json());

    return success(
      updateCalendarEvent({
        actorId: session.userId,
        actorRole: session.role,
        eventId,
        patch
      })
    );
  });
}
