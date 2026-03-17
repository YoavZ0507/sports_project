import { beforeEach, describe, expect, it } from "vitest";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { createWorkspace, requestToJoinWorkspace, approveAthlete } from "@/lib/services/workspaceService";
import { createCalendarEvent } from "@/lib/services/calendarService";

beforeEach(() => {
  repository.reset();
  repository.upsertUser({ id: "coach", email: "coach@test", fullName: "Coach", locale: "en" });
  repository.upsertUser({ id: "athlete", email: "athlete@test", fullName: "Athlete", locale: "he" });
});

describe("generic backbone sync", () => {
  it("creates org backbone records when a workspace is created and approved members join", () => {
    const workspace = createWorkspace({ coachId: "coach", coachRole: "coach", name: "Elite Team" });
    const pending = requestToJoinWorkspace({ workspaceId: workspace.id, athleteId: "athlete" });
    approveAthlete({ workspaceId: workspace.id, memberId: pending.id, actorId: "coach", actorRole: "coach" });

    const sport = repository.getSport("sport_generic");
    const team = repository.getTeam(`team_${workspace.id}`);
    const club = repository.getClub(`club_${workspace.id}`);
    const coachMembership = repository.getTeamMembership(`team_${workspace.id}`, "coach");
    const athleteMembership = repository.getTeamMembership(`team_${workspace.id}`, "athlete");

    expect(sport?.key).toBe("generic");
    expect(team?.workspaceId).toBe(workspace.id);
    expect(club?.name).toContain("Elite Team");
    expect(coachMembership?.role).toBe("coach");
    expect(athleteMembership?.role).toBe("athlete");
  });

  it("syncs calendar events into generic events with team participants", () => {
    const workspace = createWorkspace({ coachId: "coach", coachRole: "coach", name: "Calendar Team" });
    const pending = requestToJoinWorkspace({ workspaceId: workspace.id, athleteId: "athlete" });
    approveAthlete({ workspaceId: workspace.id, memberId: pending.id, actorId: "coach", actorRole: "coach" });

    const calendarEvent = createCalendarEvent({
      actorId: "coach",
      actorRole: "coach",
      workspaceId: workspace.id,
      title: "Morning Session",
      eventType: "training",
      startAt: "2026-03-17T07:00:00.000Z",
      endAt: "2026-03-17T09:00:00.000Z"
    });

    const genericEvent = repository.getGenericEvent(`generic_event_${calendarEvent.id}`);
    const participants = repository.listEventParticipants(`generic_event_${calendarEvent.id}`);
    const eventType = repository.getGenericEventType("event_type_training");

    expect(eventType?.key).toBe("training");
    expect(genericEvent?.teamId).toBe(`team_${workspace.id}`);
    expect(participants).toHaveLength(2);
    expect(participants.map((participant) => participant.participantRole).sort()).toEqual(["coach", "player"]);
  });
});
