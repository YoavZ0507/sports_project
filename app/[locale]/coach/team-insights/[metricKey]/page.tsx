import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getMetricSummaries } from "@/lib/metrics/teamMetricSummary";

export default async function MetricScoresPage({
  params
}: {
  params: Promise<{ locale: string; metricKey: string }>;
}) {
  ensureDemoData();
  const { locale, metricKey } = await params;
  const session = await requireRole(locale, "coach");
  const isHebrew = locale === "he";

  const workspaceId =
    repository.listWorkspaces().find((workspace) => workspace.coachId === session.userId)?.id ??
    getPrimaryWorkspaceId();
  const metrics = getMetricSummaries(workspaceId);
  const decodedMetricKey = decodeURIComponent(metricKey);
  const metric = metrics.find((entry) => entry.key === decodedMetricKey);
  if (!metric) notFound();

  const sorted = [...metric.scores].sort((a, b) => b.average - a.average);

  return (
    <section className="team-insights-layout">
      <section className="card">
        <h2>{isHebrew ? `רשימת ציונים - ${metric.key}` : `Score List - ${metric.key}`}</h2>
        <p>
          {isHebrew ? "כל שחקן מוצג עם ממוצע המדד וכל המדידות שנכנסו לחישוב." : "Each player shows metric average and all samples used in the calculation."}
        </p>
      </section>

      <section className="card">
        <div className="metric-score-list">
          {sorted.map((entry, index) => (
            <article key={`${metric.key}-${entry.athleteId}`} className="panel-link-card static-card">
              <h3>{index + 1}. {entry.athleteName}</h3>
              <p>{isHebrew ? "ממוצע" : "Average"}: {entry.average} {metric.unit ?? ""}</p>
              <p>{isHebrew ? "ציונים" : "Scores"}: {[...entry.values].sort((a, b) => b - a).join(", ")}</p>
            </article>
          ))}
        </div>
      </section>

      <Link className="panel-link-card" href={`/${locale}/coach/team-insights`}>
        <h4>{isHebrew ? "חזרה לדאשבורד מדדים" : "Back to metrics dashboard"}</h4>
      </Link>
    </section>
  );
}
