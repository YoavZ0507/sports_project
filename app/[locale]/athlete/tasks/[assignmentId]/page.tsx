import { notFound } from "next/navigation";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { listAthleteTasks } from "@/lib/services/taskService";

export default async function AthleteTaskDetailPage({
  params
}: {
  params: Promise<{ locale: string; assignmentId: string }>;
}) {
  ensureDemoData();
  const { locale, assignmentId } = await params;
  const session = await requireRole(locale, "athlete");
  const isHebrew = locale === "he";

  const workspaceId =
    repository.listWorkspaces().find((workspace) => repository.getWorkspaceMembership(workspace.id, session.userId))?.id ??
    getPrimaryWorkspaceId();

  const assignments = listAthleteTasks(workspaceId, session.userId);
  const selected = assignments.find((entry) => entry.assignment.id === assignmentId);
  if (!selected) notFound();

  const { task, assignment } = selected;

  return (
    <section className="card">
      <h2>{task.title}</h2>
      <p>
        <strong>{isHebrew ? "סטטוס" : "Status"}:</strong> {assignment.status}
      </p>
      <p>
        <strong>{isHebrew ? "תיאור" : "Description"}:</strong> {task.description}
      </p>
      <p>
        <strong>{isHebrew ? "הסבר מפורט" : "Detailed instructions"}:</strong>
      </p>
      <article className="panel-link-card static-card">
        <p>{task.detailedInstructions || (isHebrew ? "לא הוגדר הסבר מפורט" : "No detailed instructions yet")}</p>
      </article>

      <h3>{isHebrew ? "חומרים מצורפים" : "Attached Resources"}</h3>
      <div className="resource-grid">
        {task.resources.length === 0 ? (
          <article className="panel-link-card static-card">
            <p>{isHebrew ? "אין קבצים מצורפים" : "No resources attached"}</p>
          </article>
        ) : (
          task.resources.map((resource) => (
            <article key={resource.id} className="panel-link-card static-card">
              <h4>{resource.name}</h4>
              <p>{resource.type}</p>

              {resource.type === "video" ? (
                <video controls className="task-video" src={resource.url} />
              ) : null}

              {resource.type === "text" && resource.textPreview ? (
                <p>{resource.textPreview}</p>
              ) : null}

              <a className="rect-button rect-button-secondary" href={resource.url} target="_blank" rel="noreferrer">
                {isHebrew ? "פתח קובץ" : "Open file"}
              </a>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
