import { repository } from "@/lib/repositories/inMemoryRepository";

export function isCoachInWorkspace(workspaceId: string, userId: string): boolean {
  const workspace = repository.getWorkspace(workspaceId);
  if (!workspace) return false;
  if (workspace.coachId === userId) return true;

  const membership = repository.getWorkspaceMembership(workspaceId, userId);
  return membership?.role === "coach";
}

export function getCoachWorkspaceIds(userId: string): string[] {
  return repository
    .listWorkspaces()
    .filter((workspace) => isCoachInWorkspace(workspace.id, userId))
    .map((workspace) => workspace.id);
}

export function getPrimaryCoachWorkspaceId(userId: string): string | undefined {
  return getCoachWorkspaceIds(userId)[0];
}
