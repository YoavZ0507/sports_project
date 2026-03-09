import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { repository } from "@/lib/repositories/inMemoryRepository";

export default function CoachTasksPage() {
  ensureDemoData();
  const workspaceId = getPrimaryWorkspaceId();
  const tasks = repository.listTasks(workspaceId);

  return (
    <section className="card">
      <h2>Task Builder and Assignment Board</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            <span className="badge">{task.scheduleType}</span>
            <p>{task.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
