import { ensureDemoData } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";

export default async function DataBackbonePage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "coach");
  const isHebrew = locale === "he";

  const teams = repository.listTeams();
  const scopedTeams = teams.filter((team) => repository.getTeamMembership(team.id, session.userId)?.role === "coach");
  const scopedClubIds = new Set(scopedTeams.map((team) => team.clubId));
  const scopedClubs = repository.listClubs().filter((club) => scopedClubIds.has(club.id));
  const scopedMemberships = scopedTeams.flatMap((team) => repository.listTeamMemberships(team.id));
  const scopedEvents = scopedTeams.flatMap((team) => repository.listGenericEvents(team.id));
  const eventParticipantCount = scopedEvents.reduce((sum, event) => sum + repository.listEventParticipants(event.id).length, 0);

  return (
    <section className="coach-dashboard-layout">
      <section className="card">
        <h2>{isHebrew ? "שכבת נתונים גנרית" : "Generic Data Backbone"}</h2>
        <p>
          {isHebrew
            ? "תצוגת בקרה פנימית של המודל החדש שמסתנכרן אוטומטית מהמערכת הקיימת."
            : "Internal control view of the new generic model that syncs automatically from the current app."}
        </p>
      </section>

      <section className="card">
        <div className="coach-status-grid">
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "קבוצות מסונכרנות" : "Synced Teams"}</h3>
            <p>{scopedTeams.length}</p>
          </article>
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "מועדונים" : "Clubs"}</h3>
            <p>{scopedClubs.length}</p>
          </article>
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "חברויות קבוצה" : "Team Memberships"}</h3>
            <p>{scopedMemberships.length}</p>
          </article>
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "אירועים גנריים" : "Generic Events"}</h3>
            <p>{scopedEvents.length}</p>
          </article>
        </div>
      </section>

      <section className="card">
        <h3>{isHebrew ? "קבוצות" : "Teams"}</h3>
        <div className="resource-grid">
          {scopedTeams.map((team) => (
            <article key={team.id} className="panel-link-card static-card">
              <h4>{team.name}</h4>
              <p>{isHebrew ? "Team ID" : "Team ID"}: {team.id}</p>
              <p>{isHebrew ? "Club ID" : "Club ID"}: {team.clubId}</p>
              <p>{isHebrew ? "Season ID" : "Season ID"}: {team.seasonId}</p>
              <p>{isHebrew ? "Workspace ID" : "Workspace ID"}: {team.workspaceId}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>{isHebrew ? "חברי קבוצה" : "Team Members"}</h3>
        <div className="resource-grid">
          {scopedMemberships.map((membership) => {
            const user = repository.getUser(membership.userId);
            return (
              <article key={membership.id} className="panel-link-card static-card">
                <h4>{user?.fullName ?? membership.userId}</h4>
                <p>{isHebrew ? "תפקיד" : "Role"}: {membership.role}</p>
                <p>{isHebrew ? "קבוצה" : "Team"}: {membership.teamId}</p>
                <p>{isHebrew ? "מקור" : "Source membership"}: {membership.sourceWorkspaceMemberId}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>{isHebrew ? "אירועים מסונכרנים" : "Synced Events"}</h3>
        <p>
          {isHebrew ? "סך משתתפים משויכים באירועים" : "Total linked participants across events"}: {eventParticipantCount}
        </p>
        <div className="resource-grid">
          {scopedEvents.map((event) => {
            const eventType = repository.getGenericEventType(event.eventTypeId);
            const participantCount = repository.listEventParticipants(event.id).length;
            return (
              <article key={event.id} className="panel-link-card static-card">
                <h4>{event.title}</h4>
                <p>{isHebrew ? "סוג" : "Type"}: {eventType?.key ?? event.eventTypeId}</p>
                <p>{isHebrew ? "צוות/קבוצה" : "Team"}: {event.teamId}</p>
                <p>{isHebrew ? "משתתפים" : "Participants"}: {participantCount}</p>
                <p>{isHebrew ? "מקור יומן" : "Source calendar"}: {event.sourceCalendarEventId}</p>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
