import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { ProgressBarChart } from "@/components/progress-bar-chart";
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

  const completed = assignments.filter((entry) => entry.assignment.status === "completed").length;
  const inProgress = assignments.filter((entry) => entry.assignment.status === "in_progress").length;
  const blocked = assignments.filter((entry) => entry.assignment.status === "blocked").length;
  const completionRate = assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100);

  const upcoming = assignments
    .filter((entry) => Boolean(entry.task.dueDate) || entry.task.scheduleType === "recurring")
    .slice(0, 4);

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

  const completionOverTasks = assignments.map((entry) => ({
    label: entry.task.title,
    value: entry.assignment.status === "completed" ? 100 : entry.assignment.status === "in_progress" ? 60 : entry.assignment.status === "blocked" ? 20 : 0
  }));

  return (
    <section className="athlete-dashboard-layout">
      <section className="card">
        <h2>{isHebrew ? `לוח שחקן: ${athlete?.fullName ?? ""}` : `Player Board: ${athlete?.fullName ?? ""}`}</h2>
        <div className="coach-status-grid">
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "אחוז התקדמות" : "Progress rate"}</h3>
            <p>{completionRate}%</p>
          </article>
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "משימות בתהליך" : "In-progress tasks"}</h3>
            <p>{inProgress}</p>
          </article>
          <article className="panel-link-card static-card">
            <h3>{isHebrew ? "משימות חסומות" : "Blocked tasks"}</h3>
            <p>{blocked}</p>
          </article>
        </div>
      </section>

      <section className="card">
        <h2>{isHebrew ? "משימות קרובות" : "Upcoming Tasks"}</h2>
        <div className="coach-athlete-list">
          {upcoming.map(({ task, assignment }) => (
            <article key={assignment.id} className="panel-link-card static-card">
              <h3>{task.title}</h3>
              <p>{isHebrew ? "סטטוס" : "Status"}: {assignment.status}</p>
              <p>{isHebrew ? "תאריך יעד" : "Due date"}: {task.dueDate ?? (isHebrew ? "מחזורי" : "Recurring")}</p>
              <p>{task.description}</p>
            </article>
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

      <ProgressBarChart
        title={isHebrew ? "גרף התקדמות משימות" : "Task Progress Chart"}
        emptyText={isHebrew ? "אין משימות להצגת גרף" : "No tasks available for chart"}
        data={completionOverTasks}
      />
    </section>
  );
}
