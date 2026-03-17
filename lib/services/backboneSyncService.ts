import { repository } from "@/lib/repositories/inMemoryRepository";
import type {
  CalendarEvent,
  EventParticipant,
  GenericEvent,
  GenericEventType,
  League,
  Season,
  Sport,
  Team,
  TeamMembership,
  Workspace,
  WorkspaceMember,
  Club
} from "@/lib/types";

const GENERIC_SPORT_ID = "sport_generic";
const GENERIC_LEAGUE_ID = "league_generic";

function deriveSeason(dateIso: string): Season {
  const sourceDate = new Date(dateIso);
  const year = sourceDate.getUTCFullYear();
  return {
    id: `season_${year}`,
    label: `${year}`,
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    createdAt: new Date().toISOString()
  };
}

function ensureGenericSport(): Sport {
  const existing = repository.getSport(GENERIC_SPORT_ID);
  if (existing) return existing;

  const sport: Sport = {
    id: GENERIC_SPORT_ID,
    key: "generic",
    name: "Generic Sport",
    createdAt: new Date().toISOString()
  };
  return repository.upsertSport(sport);
}

function ensureGenericLeague(): League {
  const existing = repository.getLeague(GENERIC_LEAGUE_ID);
  if (existing) return existing;

  const league: League = {
    id: GENERIC_LEAGUE_ID,
    sportId: ensureGenericSport().id,
    name: "Independent League",
    level: "generic",
    createdAt: new Date().toISOString()
  };
  return repository.upsertLeague(league);
}

function ensureEventType(key: CalendarEvent["eventType"]): GenericEventType {
  const existing = repository.getGenericEventType(`event_type_${key}`);
  if (existing) return existing;

  const eventType: GenericEventType = {
    id: `event_type_${key}`,
    key,
    name: key.replace(/_/g, " "),
    createdAt: new Date().toISOString()
  };
  return repository.upsertGenericEventType(eventType);
}

function ensureSeason(dateIso: string): Season {
  const season = deriveSeason(dateIso);
  return repository.upsertSeason(season);
}

function buildClubForWorkspace(workspace: Workspace): Club {
  return {
    id: `club_${workspace.id}`,
    sportId: ensureGenericSport().id,
    name: `${workspace.name} Club`,
    createdAt: workspace.createdAt
  };
}

function buildTeamForWorkspace(workspace: Workspace): Team {
  const season = ensureSeason(workspace.createdAt);
  return {
    id: `team_${workspace.id}`,
    sportId: ensureGenericSport().id,
    clubId: `club_${workspace.id}`,
    leagueId: ensureGenericLeague().id,
    seasonId: season.id,
    workspaceId: workspace.id,
    name: workspace.name,
    createdAt: workspace.createdAt
  };
}

export function syncWorkspaceToBackbone(workspace: Workspace): Team {
  ensureGenericSport();
  ensureGenericLeague();
  ensureSeason(workspace.createdAt);
  repository.upsertClub(buildClubForWorkspace(workspace));
  return repository.upsertTeam(buildTeamForWorkspace(workspace));
}

export function syncWorkspaceMemberToBackbone(member: WorkspaceMember): TeamMembership | null {
  if (member.role === "pending") return null;

  const workspace = repository.getWorkspace(member.workspaceId);
  if (!workspace) {
    throw new Error("workspace not found");
  }

  const team = syncWorkspaceToBackbone(workspace);
  const membership: TeamMembership = {
    id: `team_member_${member.id}`,
    teamId: team.id,
    clubId: team.clubId,
    userId: member.userId,
    role: member.role,
    sourceWorkspaceMemberId: member.id,
    createdAt: member.createdAt
  };
  return repository.upsertTeamMembership(membership);
}

function mapParticipantRole(role: WorkspaceMember["role"]): EventParticipant["participantRole"] {
  return role === "athlete" ? "player" : "coach";
}

export function syncCalendarEventToBackbone(event: CalendarEvent): GenericEvent {
  const workspace = repository.getWorkspace(event.workspaceId);
  if (!workspace) {
    throw new Error("workspace not found");
  }

  const team = syncWorkspaceToBackbone(workspace);
  const eventType = ensureEventType(event.eventType);
  const genericEvent: GenericEvent = {
    id: `generic_event_${event.id}`,
    sourceCalendarEventId: event.id,
    eventTypeId: eventType.id,
    sportId: team.sportId,
    clubId: team.clubId,
    teamId: team.id,
    seasonId: team.seasonId,
    title: event.title,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    status: "planned",
    createdBy: event.createdBy,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };

  const saved = repository.upsertGenericEvent(genericEvent);
  const members = repository.listWorkspaceMembers(workspace.id).filter((member) => member.role !== "pending");
  members.forEach((member) => {
    syncWorkspaceMemberToBackbone(member);
    repository.upsertEventParticipant({
      id: `event_participant_${event.id}_${member.id}`,
      eventId: saved.id,
      userId: member.userId,
      participantRole: mapParticipantRole(member.role),
      attendanceStatus: "planned",
      sourceWorkspaceMemberId: member.id,
      createdAt: event.createdAt
    });
  });

  return saved;
}

export function syncAllCurrentDataToBackbone(): void {
  repository.listWorkspaces().forEach((workspace) => {
    syncWorkspaceToBackbone(workspace);
    repository.listWorkspaceMembers(workspace.id).forEach((member) => {
      syncWorkspaceMemberToBackbone(member);
    });
    repository.listCalendarEvents(workspace.id).forEach((event) => {
      syncCalendarEventToBackbone(event);
    });
  });
}
