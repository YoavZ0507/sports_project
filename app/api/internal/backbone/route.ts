import { getSessionFromHeaders } from "@/lib/auth";
import { success, withApiError } from "@/lib/api";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { getCoachWorkspaceIds } from "@/lib/workspaceAccess";

export async function GET() {
  return withApiError(async () => {
    const session = await getSessionFromHeaders();
    if (session.role !== "coach") {
      throw new Error("unauthorized");
    }

    const workspaceIds = new Set(getCoachWorkspaceIds(session.userId));
    const teams = repository.listTeams().filter((team) => workspaceIds.has(team.workspaceId));
    const teamIds = new Set(teams.map((team) => team.id));
    const clubIds = new Set(teams.map((team) => team.clubId));
    const genericEvents = teams.flatMap((team) => repository.listGenericEvents(team.id));

    return success({
      sports: repository.listSports(),
      clubs: repository.listClubs().filter((club) => clubIds.has(club.id)),
      teams,
      teamMemberships: teams.flatMap((team) => repository.listTeamMemberships(team.id)),
      genericEventTypes: repository.listGenericEventTypes(),
      genericEvents,
      eventParticipants: genericEvents.flatMap((event) => repository.listEventParticipants(event.id)),
      scopedTeamIds: [...teamIds]
    });
  });
}
