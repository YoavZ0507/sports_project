import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getMetricSummaries } from "@/lib/metrics/teamMetricSummary";

export default async function AthleteTeamMetricsPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "athlete");
  const isHebrew = locale === "he";

  const workspaceId =
    repository.listWorkspaces().find((workspace) => repository.getWorkspaceMembership(workspace.id, session.userId))?.id ??
    getPrimaryWorkspaceId();

  const metrics = getMetricSummaries(workspaceId);

  return (
    <section className="team-insights-layout">
      <section className="card">
        <h2>{isHebrew ? "מדדי קבוצה - דירוג אישי" : "Team Metrics - Personal Ranking"}</h2>
        <p>
          {isHebrew
            ? "בכל מדד מוצג רק הדירוג האישי שלך מול הקבוצה, ללא חשיפת ציונים פרטניים של שחקנים אחרים."
            : "Each metric shows only your personal ranking against the team without exposing other players' private scores."}
        </p>
      </section>

      {metrics.length === 0 ? (
        <section className="card">
          <p>{isHebrew ? "אין נתונים להצגה כרגע." : "No metrics available yet."}</p>
        </section>
      ) : null}

      {metrics.map((metric) => {
        const sorted = [...metric.scores].sort((a, b) => b.average - a.average);
        const personalIndex = sorted.findIndex((entry) => entry.athleteId === session.userId);
        const personal = personalIndex >= 0 ? sorted[personalIndex] : null;

        return (
          <article key={metric.key} className="card">
            <h3>{metric.key}</h3>
            {personal ? (
              <div className="coach-status-grid">
                <article className="panel-link-card static-card">
                  <h4>{isHebrew ? "דירוג בקבוצה" : "Team rank"}</h4>
                  <p>
                    #{personalIndex + 1} / {sorted.length}
                  </p>
                </article>

                <article className="panel-link-card static-card">
                  <h4>{isHebrew ? "ממוצע אישי" : "Personal average"}</h4>
                  <p>
                    {personal.average} {metric.unit ?? ""}
                  </p>
                </article>

                <article className="panel-link-card static-card">
                  <h4>{isHebrew ? "ממוצע קבוצה" : "Team average"}</h4>
                  <p>
                    {metric.teamAverage} {metric.unit ?? ""}
                  </p>
                </article>
              </div>
            ) : (
              <article className="panel-link-card static-card">
                <p>{isHebrew ? "אין מספיק נתונים אישיים במדד זה." : "No personal data yet for this metric."}</p>
              </article>
            )}
          </article>
        );
      })}

    </section>
  );
}
