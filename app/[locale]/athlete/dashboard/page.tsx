import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { listAthleteTasks } from "@/lib/services/taskService";
import { listProgress } from "@/lib/services/progressService";
import { repository } from "@/lib/repositories/inMemoryRepository";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export default async function AthleteDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "athlete");
  const isHebrew = locale === "he";

  const athleteId = session.userId;
  const workspaceId =
    repository.listWorkspaces().find((workspace) => repository.getWorkspaceMembership(workspace.id, athleteId))?.id ??
    getPrimaryWorkspaceId();
  const athlete = repository.getUser(athleteId);
  const assignments = listAthleteTasks(workspaceId, athleteId);

  const activeTasks = assignments
    .filter((entry) => entry.assignment.status !== "completed")
    .slice(0, 8);

  const selectedMetricBuckets = new Map<string, number[]>();
  assignments.forEach(({ assignment }) => {
    listProgress(assignment.id).forEach((update) => {
      update.metrics.forEach((metric) => {
        const current = selectedMetricBuckets.get(metric.metricKey) ?? [];
        current.push(metric.metricValue);
        selectedMetricBuckets.set(metric.metricKey, current);
      });
    });
  });

  const selectedMetrics = [...selectedMetricBuckets.entries()].map(([metricKey, values]) => ({
    metricKey,
    average: average(values),
    samples: values.length
  }));

  return (
    <section className="athlete-dashboard-layout">
      <section className="card">
        <h2>{isHebrew ? `לוח שחקן: ${athlete?.fullName ?? ""}` : `Player Board: ${athlete?.fullName ?? ""}`}</h2>
        <p>
          {isHebrew
            ? "בדף זה מוצגות רק המשימות שטרם הושלמו והמדדים האישיים שלך."
            : "This page shows only your not-completed tasks and your personal metrics."}
        </p>
      </section>

      <section className="card">
        <h2>{isHebrew ? "משימות קיימות שלא בוצעו" : "Existing Tasks Not Completed"}</h2>
        <div className="coach-athlete-list">
          {activeTasks.length === 0 ? (
            <article className="panel-link-card static-card">
              <p>{isHebrew ? "כל המשימות הושלמו. עבודה טובה." : "All tasks are completed. Great job."}</p>
            </article>
          ) : null}

          {activeTasks.map(({ task, assignment }) => (
            <Link key={assignment.id} className="panel-link-card" href={`/${locale}/athlete/tasks/${assignment.id}`}>
              <h3>{task.title}</h3>
              <p>{isHebrew ? "סטטוס" : "Status"}: {assignment.status}</p>
              <p>{isHebrew ? "תאריך יעד" : "Due date"}: {task.dueDate ?? (isHebrew ? "מחזורי" : "Recurring")}</p>
              <p>{task.description}</p>
              <span className="card-action-text">{isHebrew ? "כניסה למשימה המפורטת" : "Open detailed task"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>{isHebrew ? "מדדים נבחרים" : "Selected Metrics"}</h2>
        <div className="coach-status-grid">
          {selectedMetrics.length === 0 ? (
            <article className="panel-link-card static-card">
              <p>{isHebrew ? "אין נתונים כרגע" : "No metrics yet"}</p>
            </article>
          ) : (
            selectedMetrics.map((metric) => (
              <article className="panel-link-card static-card" key={metric.metricKey}>
                <h3>{metric.metricKey}</h3>
                <p>{isHebrew ? "ממוצע" : "Average"}: {metric.average}</p>
                <p>{isHebrew ? "מספר מדידות" : "Samples"}: {metric.samples}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <Link className="panel-link-card" href={`/${locale}/athlete/team-metrics`}>
        <h3>{isHebrew ? "מדדי קבוצה ודירוג אישי" : "Team Metrics and Personal Ranking"}</h3>
        <p>
          {isHebrew
            ? "צפייה בדירוג שלך בכל מדד ביחס לקבוצה, ללא חשיפת ציונים פרטניים של אחרים."
            : "View your ranking in each metric relative to the team, without exposing others' private scores."}
        </p>
      </Link>
    </section>
  );
}
