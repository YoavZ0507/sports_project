import Link from "next/link";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { listFeedback, listProgress } from "@/lib/services/progressService";
import { repository } from "@/lib/repositories/inMemoryRepository";

export default async function CoachAthleteDetailPage({
  params
}: {
  params: Promise<{ locale: string; athleteId: string }>;
}) {
  ensureDemoData();
  const { locale, athleteId } = await params;
  const isHebrew = locale === "he";

  const workspaceId = getPrimaryWorkspaceId();
  const athlete = repository.getUser(athleteId);
  const assignments = repository.listAssignmentsForAthlete(workspaceId, athleteId);

  const completed = assignments.filter((entry) => entry.assignment.status === "completed").length;
  const inProgress = assignments.filter((entry) => entry.assignment.status === "in_progress").length;
  const blocked = assignments.filter((entry) => entry.assignment.status === "blocked").length;
  const completionRate = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);

  return (
    <section className="coach-athlete-detail-layout">
      <section className="card">
        <h2>{athlete?.fullName ?? athleteId}</h2>
        <div className="coach-status-grid">
          <div className="panel-link-card static-card">
            <h3>{isHebrew ? "אחוז השלמה" : "Completion Rate"}</h3>
            <p>{completionRate}%</p>
          </div>
          <div className="panel-link-card static-card">
            <h3>{isHebrew ? "בתהליך" : "In Progress"}</h3>
            <p>{inProgress}</p>
          </div>
          <div className="panel-link-card static-card">
            <h3>{isHebrew ? "חסום" : "Blocked"}</h3>
            <p>{blocked}</p>
          </div>
        </div>

        <h3>{isHebrew ? "התראות ומשוב אחרון" : "Recent Updates and Feedback"}</h3>
        <div className="coach-athlete-list">
          {assignments.map(({ assignment, task }) => {
            const updates = listProgress(assignment.id);
            const latest = updates.at(-1);
            const feedback = latest ? listFeedback(latest.id) : [];

            return (
              <article key={assignment.id} className="panel-link-card static-card">
                <h3>{task.title}</h3>
                <p>{isHebrew ? "סטטוס" : "Status"}: {assignment.status}</p>
                {latest ? <p>{isHebrew ? "עדכון" : "Update"}: {latest.note}</p> : <p>{isHebrew ? "אין עדכון" : "No update yet"}</p>}
                {feedback.length > 0 ? (
                  <p>{isHebrew ? "משוב מאמן" : "Coach feedback"}: {feedback.at(-1)?.comment}</p>
                ) : (
                  <p>{isHebrew ? "טרם ניתן משוב" : "No feedback yet"}</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="card coach-actions-list">
        <Link className="panel-link-card" href={`/${locale}/coach/progress`}>
          <h3>{isHebrew ? "לתת פידבק לשחקן" : "Give Player Feedback"}</h3>
          <p>{isHebrew ? "מעבר למסך המשוב והתקדמות של המאמן." : "Open the coach progress panel to submit new feedback."}</p>
        </Link>

        <Link className="panel-link-card" href={`/${locale}/coach/dashboard`}>
          <h3>{isHebrew ? "חזרה ללוח מאמן" : "Back to Coach Board"}</h3>
          <p>{isHebrew ? "חזרה לרשימת כל השחקנים." : "Return to the full athletes list."}</p>
        </Link>
      </section>
    </section>
  );
}
