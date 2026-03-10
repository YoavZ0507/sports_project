import { z } from "zod";
import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { createCalendarEvent, listCalendarEventsForUser } from "@/lib/services/calendarService";

const createSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  eventType: z.enum(["training", "game", "special"]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().optional()
});

export async function POST(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const body = createSchema.parse(await request.json());

    const event = createCalendarEvent({
      actorId: session.userId,
      actorRole: session.role,
      workspaceId: body.workspaceId,
      title: body.title,
      description: body.description,
      eventType: body.eventType,
      startAt: body.startAt,
      endAt: body.endAt,
      location: body.location
    });

    return success(event, 201);
  });
}

export async function GET(request: Request) {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") ?? "";

    return success(
      listCalendarEventsForUser({
        actorId: session.userId,
        actorRole: session.role,
        workspaceId
      })
    );
  });
}
