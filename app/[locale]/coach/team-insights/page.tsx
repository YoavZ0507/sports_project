import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { repository } from "@/lib/repositories/inMemoryRepository";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export default async function TeamInsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const isHebrew = locale === "he";
  const workspaceId = getPrimaryWorkspaceId();

  const athletes = repository.listWorkspaceMembers(workspaceId).filter((member) => member.role === "athlete");

  const metricByKey = new Map<string, Array<{ athleteName: string; value: number; unit?: string }>>();

  for (const athlete of athletes) {
    const user = repository.getUser(athlete.userId);
    const assignments = repository.listAssignmentsForAthlete(workspaceId, athlete.userId);

    for (const { assignment } of assignments) {
      const updates = repository.listProgressForAssignment(assignment.id);
      for (const update of updates) {
        for (const metric of update.metrics) {
          const list = metricByKey.get(metric.metricKey) ?? [];
          list.push({
            athleteName: user?.fullName ?? athlete.userId,
            value: metric.metricValue,
            unit: metric.unit
          });
          metricByKey.set(metric.metricKey, list);
        }
      }
    }
  }

  const metricCards = [...metricByKey.entries()].map(([key, entries]) => {
    const avg = average(entries.map((entry) => entry.value));
    const top = [...entries].sort((a, b) => b.value - a.value)[0];
    return { key, avg, top, unit: top?.unit };
  });

  return (
    <section className="card">
      <h2>{isHebrew ? "דאשבורד קבוצה - ממוצעים ומצטיינים" : "Team Dashboard - Averages and Top Performers"}</h2>

      <div className="coach-status-grid">
        {metricCards.map((metric) => (
          <article key={metric.key} className="panel-link-card static-card">
            <h3>{metric.key}</h3>
            <p>{isHebrew ? "ממוצע קבוצה" : "Team average"}: {metric.avg} {metric.unit ?? ""}</p>
            <p>
              {isHebrew ? "מצטיין" : "Top performer"}: {metric.top?.athleteName} ({metric.top?.value} {metric.unit ?? ""})
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
