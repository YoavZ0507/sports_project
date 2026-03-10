import { CoachTaskBuilder } from "@/components/coach-task-builder";
import { ensureDemoData, getPrimaryWorkspaceId } from "@/lib/demoData";
import { getPrimaryCoachWorkspaceId } from "@/lib/workspaceAccess";
import { requireRole } from "@/lib/auth";
import { repository } from "@/lib/repositories/inMemoryRepository";

export default async function CoachTasksPage({ params }: { params: Promise<{ locale: string }> }) {
  ensureDemoData();
  const { locale } = await params;
  const session = await requireRole(locale, "coach");

  const workspaceId =
    getPrimaryCoachWorkspaceId(session.userId) ??
    getPrimaryWorkspaceId();

  const athletes = repository
    .listWorkspaceMembers(workspaceId)
    .filter((member) => member.role === "athlete")
    .map((member) => ({
      id: member.userId,
      name: repository.getUser(member.userId)?.fullName ?? member.userId
    }));

  const tasks = repository.listTasks(workspaceId);

  return <CoachTaskBuilder locale={locale} workspaceId={workspaceId} athletes={athletes} existingTasks={tasks} />;
}
