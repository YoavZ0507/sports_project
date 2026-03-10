import { repository } from "@/lib/repositories/inMemoryRepository";
import { getAccountByCalendarToken } from "@/lib/authStore";
import { buildIcsCalendar } from "@/lib/services/calendarService";

export async function GET(request: Request) {
  const { searchParams, origin, pathname } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const account = getAccountByCalendarToken(token);

  if (!account) {
    return new Response("Unauthorized", { status: 401 });
  }

  const workspaceIds = repository
    .listWorkspaces()
    .filter((workspace) => {
      const membership = repository.getWorkspaceMembership(workspace.id, account.userId);
      return (
        workspace.coachId === account.userId ||
        membership?.role === "coach" ||
        membership?.role === "athlete"
      );
    })
    .map((workspace) => workspace.id);

  const events = workspaceIds.flatMap((workspaceId) => repository.listCalendarEvents(workspaceId));

  const icsBody = buildIcsCalendar({
    name: `${account.fullName} - Athlete Task Hub`,
    events,
    sourceUrl: `${origin}${pathname}?token=${token}`
  });

  return new Response(icsBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="athlete-task-hub.ics"'
    }
  });
}
