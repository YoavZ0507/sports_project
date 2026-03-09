import Link from "next/link";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { ProgressBarChart } from "@/components/progress-bar-chart";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { listMembers } from "@/lib/services/workspaceService";

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default async function CoachDashboard({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "coach");
  const isHebrew = locale === "he";
  const workspaceId =
    repository.listWorkspaces().find((workspace) => workspace.coachId === session.userId)?.id ??
    getPrimaryWorkspaceId();

  const athletes = listMembers(workspaceId).filter((member) => member.role === "athlete");

  const athleteCards = athletes.map((member) => {
    const user = repository.getUser(member.userId);
    const assignments = repository.listAssignmentsForAthlete(workspaceId, member.userId);
    const completed = assignments.filter((entry) => entry.assignment.status === "completed").length;
    const inProgress = assignments.filter((entry) => entry.assignment.status === "in_progress").length;
    const blocked = assignments.filter((entry) => entry.assignment.status === "blocked").length;
    const completionRate = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);

    return {
      athleteId: member.userId,
      name: user?.fullName ?? member.userId,
      completionRate,
      inProgress,
      blocked
    };
  });

  const completionAverage = avg(athleteCards.map((athlete) => athlete.completionRate));
  const totalBlocked = athleteCards.reduce((sum, athlete) => sum + athlete.blocked, 0);
  const totalInProgress = athleteCards.reduce((sum, athlete) => sum + athlete.inProgress, 0);
  const topAthlete = [...athleteCards].sort((a, b) => b.completionRate - a.completionRate)[0];

  return (
    <section className="coach-dashboard-layout">
      <section className="card">
        <h2>{isHebrew ? "שחקנים" : "Players"}</h2>
        <div className="coach-athlete-list">
          {athleteCards.map((athlete) => (
            <Link key={athlete.athleteId} className="panel-link-card" href={`/${locale}/coach/athletes/${athlete.athleteId}`}>
              <h3>{athlete.name}</h3>
              <p>{isHebrew ? "אחוז השלמה" : "Completion rate"}: {athlete.completionRate}%</p>
              <p>{isHebrew ? "בתהליך" : "In progress"}: {athlete.inProgress}</p>
              <p>{isHebrew ? "חסום" : "Blocked"}: {athlete.blocked}</p>
              <span className="card-action-text">{isHebrew ? "כניסה לסטטוס אישי + פידבק" : "Open personal status + feedback"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="coach-right-column">
        <section className="card">
          <h2>{isHebrew ? "סטטוס קבוצה" : "Team Status"}</h2>
          <div className="coach-status-grid">
            <article className="panel-link-card static-card">
              <h3>{isHebrew ? "ממוצע השלמה" : "Avg completion"}</h3>
              <p>{completionAverage}%</p>
            </article>
            <article className="panel-link-card static-card">
              <h3>{isHebrew ? "משימות בתהליך" : "In-progress tasks"}</h3>
              <p>{totalInProgress}</p>
            </article>
            <article className="panel-link-card static-card">
              <h3>{isHebrew ? "משימות חסומות" : "Blocked tasks"}</h3>
              <p>{totalBlocked}</p>
            </article>
            <article className="panel-link-card static-card">
              <h3>{isHebrew ? "מצטיין" : "Top performer"}</h3>
              <p>{topAthlete ? `${topAthlete.name} (${topAthlete.completionRate}%)` : "-"}</p>
            </article>
          </div>
        </section>

        <section className="card">
          <h2>{isHebrew ? "פעולות מהירות" : "Quick Actions"}</h2>
          <div className="coach-actions-list">
            <Link className="panel-link-card" href={`/${locale}/coach/tasks`}>
              <h3>{isHebrew ? "הוספת משימה" : "Add Task"}</h3>
              <p>{isHebrew ? "יצירה והקצאה של משימות לשחקנים." : "Create and assign tasks to players."}</p>
            </Link>

            <Link className="panel-link-card" href={`/${locale}/coach/team-insights`}>
              <h3>{isHebrew ? "דאשבורד ממוצעים ומצטיינים" : "Averages and top performers"}</h3>
              <p>
                {isHebrew
                  ? "צפייה במדדי קבוצה ממוצעים ומצטיינים בכל רובליקה."
                  : "View team averages and top athletes per metric."}
              </p>
            </Link>
          </div>
        </section>

        <ProgressBarChart
          title={isHebrew ? "גרף התקדמות שחקנים" : "Player Progress Chart"}
          emptyText={isHebrew ? "אין נתונים להצגה" : "No chart data available"}
          data={athleteCards.map((athlete) => ({
            label: athlete.name,
            value: athlete.completionRate
          }))}
        />
      </section>
    </section>
  );
}
