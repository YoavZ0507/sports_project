interface BarPoint {
  label: string;
  value: number;
}

export function ProgressBarChart({
  title,
  data,
  emptyText
}: {
  title: string;
  data: BarPoint[];
  emptyText: string;
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <article className="panel-link-card static-card">
          <p>{emptyText}</p>
        </article>
      ) : (
        <div className="chart-grid">
          {data.map((item) => (
            <article key={item.label} className="chart-row">
              <div className="chart-meta">
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
