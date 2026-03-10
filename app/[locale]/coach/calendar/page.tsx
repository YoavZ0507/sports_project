import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getPrimaryCoachWorkspaceId } from "@/lib/workspaceAccess";
import { getCalendarTokenByUserId } from "@/lib/authStore";
import { CoachCalendarManager } from "@/components/coach-calendar-manager";

export default async function CoachCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "coach");

  const workspaceId = getPrimaryCoachWorkspaceId(session.userId) ?? getPrimaryWorkspaceId();
  const events = repository.listCalendarEvents(workspaceId);
  const calendarToken = getCalendarTokenByUserId(session.userId) ?? "";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const calendarSyncUrl = `${appBaseUrl}/api/calendar/ics?token=${calendarToken}`;

  return (
    <CoachCalendarManager
      locale={locale}
      workspaceId={workspaceId}
      events={events}
      calendarSyncUrl={calendarSyncUrl}
    />
  );
}
