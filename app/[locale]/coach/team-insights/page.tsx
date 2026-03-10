import Link from "next/link";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getMetricSummaries } from "@/lib/metrics/teamMetricSummary";

function buildDistributionRanges(values: number[], bucketCount = 5): Array<{ label: string; count: number }> {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ label: `${min.toFixed(1)}-${max.toFixed(1)}`, count: values.length }];
  }

  const step = (max - min) / bucketCount;
  const ranges = Array.from({ length: bucketCount }, (_, index) => {
    const start = min + step * index;
    const end = index === bucketCount - 1 ? max : min + step * (index + 1);
    return {
      start,
      end,
      label: `${start.toFixed(1)}-${end.toFixed(1)}`,
      count: 0
    };
  });

  values.forEach((value) => {
    const rawIndex = Math.floor((value - min) / step);
    const safeIndex = Math.min(bucketCount - 1, Math.max(0, rawIndex));
    ranges[safeIndex].count += 1;
  });

  return ranges.map(({ label, count }) => ({ label, count }));
}

export default async function TeamInsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "coach");
  const isHebrew = locale === "he";

  const workspaceId =
    repository.listWorkspaces().find((workspace) => workspace.coachId === session.userId)?.id ??
    getPrimaryWorkspaceId();
  const metrics = getMetricSummaries(workspaceId);
  const metricsWithDistribution = metrics.map((metric) => {
    const distribution = buildDistributionRanges(metric.scores.map((entry) => entry.average));
    const maxCount = Math.max(...distribution.map((item) => item.count), 1);
    return { metric, distribution, maxCount };
  });

  return (
    <section className="team-insights-layout">
      <section className="card">
        <h2>{isHebrew ? "דאשבורד ממוצעים ומצטיינים" : "Averages and Top Performers Dashboard"}</h2>
        <p>
          {isHebrew
            ? "כל מדד מוצג כרצועה מלאה עם טופ 3, בוטום 3 וגרף עמודות של מצב הקבוצה."
            : "Each metric appears as a full-width strip with top 3, bottom 3, and a team state bar chart."}
        </p>
      </section>

      {metrics.length === 0 ? (
        <section className="card">
          <p>{isHebrew ? "עדיין אין מדדים להצגה." : "No metrics available yet."}</p>
        </section>
      ) : null}

      {metricsWithDistribution.map(({ metric, distribution, maxCount }) => (
        <article key={metric.key} className="card metric-strip">
          <header className="metric-strip-header">
            <h3>{metric.key}</h3>
            <p>
              {isHebrew ? "ממוצע קבוצה" : "Team average"}: <strong>{metric.teamAverage} {metric.unit ?? ""}</strong>
            </p>
          </header>

          <div className="metric-strip-content">
            <section className="panel-link-card static-card">
              <h4>{isHebrew ? "שלושת הטובים ביותר" : "Top 3"}</h4>
              <ul>
                {metric.topThree.map((entry, index) => (
                  <li key={`${metric.key}-top-${entry.athleteId}`}>
                    {index + 1}. {entry.athleteName} - {entry.average} {metric.unit ?? ""}
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel-link-card static-card">
              <h4>{isHebrew ? "שלושת הפחות טובים" : "Bottom 3"}</h4>
              <ul>
                {metric.bottomThree.map((entry, index) => (
                  <li key={`${metric.key}-bottom-${entry.athleteId}`}>
                    {index + 1}. {entry.athleteName} - {entry.average} {metric.unit ?? ""}
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel-link-card static-card">
              <h4>{isHebrew ? "גרף התפלגות מצב קבוצה" : "Team Distribution Bar Chart"}</h4>
              <div className="chart-grid">
                {distribution.map((bucket) => (
                  <article key={`${metric.key}-bucket-${bucket.label}`} className="chart-row">
                    <div className="chart-meta">
                      <span>{bucket.label}</span>
                      <strong>
                        {bucket.count} {isHebrew ? "שחקנים" : "players"}
                      </strong>
                    </div>
                    <div className="chart-track">
                      <div
                        className="chart-fill"
                        style={{
                          width: `${Math.max(6, Math.min(100, (bucket.count / maxCount) * 100))}%`
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <Link className="panel-link-card metric-link" href={`/${locale}/coach/team-insights/${encodeURIComponent(metric.key)}`}>
            <h4>{isHebrew ? "רשימת ציונים מלאה במדד" : "Full score list in this metric"}</h4>
            <p>{isHebrew ? "מעבר לרשימת כל ציוני הקבוצה במדד זה." : "Open all team scores for this metric."}</p>
          </Link>
        </article>
      ))}
    </section>
  );
}
