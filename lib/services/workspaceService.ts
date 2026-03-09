import { createId } from "@/lib/ids";
import { requireCoach } from "@/lib/permissions";
import { repository } from "@/lib/repositories/inMemoryRepository";
import type { Workspace, WorkspaceMember } from "@/lib/types";

export function createWorkspace(input: { coachId: string; coachRole: "coach" | "athlete"; name: string }): Workspace {
  requireCoach(input.coachRole);

  const workspace: Workspace = {
    id: createId("ws"),
    name: input.name,
    coachId: input.coachId,
    createdAt: new Date().toISOString()
  };
  repository.createWorkspace(workspace);

  const coachMembership: WorkspaceMember = {
    id: createId("member"),
    workspaceId: workspace.id,
    userId: input.coachId,
    role: "coach",
    createdAt: new Date().toISOString()
  };
  repository.createWorkspaceMember(coachMembership);

  return workspace;
}

export function requestToJoinWorkspace(input: { workspaceId: string; athleteId: string }): WorkspaceMember {
  const existing = repository.getWorkspaceMembership(input.workspaceId, input.athleteId);
  if (existing) return existing;

  const member: WorkspaceMember = {
    id: createId("member"),
    workspaceId: input.workspaceId,
    userId: input.athleteId,
    role: "pending",
    createdAt: new Date().toISOString()
  };
  return repository.createWorkspaceMember(member);
}

export function approveAthlete(input: {
  workspaceId: string;
  memberId: string;
  actorId: string;
  actorRole: "coach" | "athlete";
}): WorkspaceMember {
  requireCoach(input.actorRole);
  const workspace = repository.getWorkspace(input.workspaceId);
  if (!workspace || workspace.coachId !== input.actorId) {
    throw new Error("forbidden: only workspace coach can approve");
  }

  const updated = repository.updateWorkspaceMemberRole(input.memberId, "athlete");
  if (!updated) throw new Error("member not found");
  return updated;
}

export function listMembers(workspaceId: string): WorkspaceMember[] {
  return repository.listWorkspaceMembers(workspaceId);
}
