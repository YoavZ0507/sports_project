import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { repository } from "@/lib/repositories/inMemoryRepository";

export default function CoachProgressPage() {
  ensureDemoData();
  const workspaceId = getPrimaryWorkspaceId();
  const members = repository.listWorkspaceMembers(workspaceId).filter((member) => member.role === "athlete");

  return (
    <section className="card">
      <h2>Progress Review Panel</h2>
      <ul>
        {members.map((member) => {
          const assignments = repository.listAssignmentsForAthlete(workspaceId, member.userId);
          return (
            <li key={member.id}>
              Athlete: <strong>{repository.getUser(member.userId)?.fullName ?? member.userId}</strong>
              <ul>
                {assignments.map(({ task, assignment }) => (
                  <li key={assignment.id}>
                    {task.title}: <span className="badge">{assignment.status}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
