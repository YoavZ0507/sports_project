import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getCalendarTokenByUserId } from "@/lib/authStore";
import { CalendarMonthView } from "@/components/calendar-month-view";
import { CalendarSyncActions } from "@/components/calendar-sync-actions";

export default async function AthleteCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "athlete");
  const isHebrew = locale === "he";

  const workspaceId =
    repository
      .listWorkspaces()
      .find((workspace) => repository.getWorkspaceMembership(workspace.id, session.userId)?.role === "athlete")?.id ??
    getPrimaryWorkspaceId();

  const events = repository.listCalendarEvents(workspaceId);
  const calendarToken = getCalendarTokenByUserId(session.userId) ?? "";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const calendarSyncUrl = `${appBaseUrl}/api/calendar/ics?token=${calendarToken}`;

  return (
    <section className="team-insights-layout">
      <section className="card">
        <h2>{isHebrew ? "לוח שנה אישי" : "Personal Calendar"}</h2>
        <p>
          {isHebrew
            ? "כאן רואים את לוז הקבוצה. ניתן לסנכרן ליומן האישי כדי שכל עדכון מהמאמן יופיע אוטומטית."
            : "Here you can view the team schedule and sync it to your personal calendar for automatic coach updates."}
        </p>
      </section>

      <section className="card">
        <h3>{isHebrew ? "סנכרון ליומן אישי" : "Personal Calendar Sync"}</h3>
        <article className="panel-link-card static-card">
          <CalendarSyncActions locale={locale} calendarSyncUrl={calendarSyncUrl} />
        </article>
      </section>

      <CalendarMonthView locale={locale} events={events} />

      <section className="card">
        <h3>{isHebrew ? "מופעים בלוז" : "Scheduled Events"}</h3>
        <div className="resource-grid">
          {events.length === 0 ? (
            <article className="panel-link-card static-card">
              <p>{isHebrew ? "אין כרגע אירועים" : "No events yet"}</p>
            </article>
          ) : (
            events.map((event) => (
              <article key={event.id} className="panel-link-card static-card">
                <h3>{event.title}</h3>
                <p>{isHebrew ? "סוג" : "Type"}: {event.eventType}</p>
                <p>{isHebrew ? "התחלה" : "Start"}: {new Date(event.startAt).toLocaleString(locale)}</p>
                <p>{isHebrew ? "סיום" : "End"}: {new Date(event.endAt).toLocaleString(locale)}</p>
                {event.location ? <p>{isHebrew ? "מיקום" : "Location"}: {event.location}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
