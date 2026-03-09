import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { listMembers } from "@/lib/services/workspaceService";

export default function CoachAthletesPage() {
  ensureDemoData();
  const workspaceId = getPrimaryWorkspaceId();
  const members = listMembers(workspaceId).filter((member) => member.role !== "coach");

  return (
    <section className="card">
      <h2>Athlete Roster</h2>
      <ul>
        {members.map((member) => {
          const user = repository.getUser(member.userId);
          return (
            <li key={member.id}>
              <strong>{user?.fullName ?? member.userId}</strong>
              <span className="badge">{member.role}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
