import {
  Club,
  CoachFeedback,
  CalendarEvent,
  DashboardSummary,
  EventParticipant,
  GenericEvent,
  GenericEventType,
  League,
  ProgressUpdate,
  Season,
  Sport,
  Task,
  TaskAssignment,
  Team,
  TeamMembership,
  User,
  Workspace,
  WorkspaceMember
} from "@/lib/types";

export interface Repository {
  upsertUser(user: User): User;
  getUser(userId: string): User | undefined;

  createWorkspace(workspace: Workspace): Workspace;
  getWorkspace(workspaceId: string): Workspace | undefined;
  listWorkspaces(): Workspace[];

  upsertSport(sport: Sport): Sport;
  getSport(sportId: string): Sport | undefined;
  listSports(): Sport[];

  upsertClub(club: Club): Club;
  getClub(clubId: string): Club | undefined;
  listClubs(): Club[];

  upsertLeague(league: League): League;
  getLeague(leagueId: string): League | undefined;
  listLeagues(): League[];

  upsertSeason(season: Season): Season;
  getSeason(seasonId: string): Season | undefined;
  listSeasons(): Season[];

  upsertTeam(team: Team): Team;
  getTeam(teamId: string): Team | undefined;
  listTeams(): Team[];

  upsertTeamMembership(membership: TeamMembership): TeamMembership;
  getTeamMembership(teamId: string, userId: string): TeamMembership | undefined;
  listTeamMemberships(teamId: string): TeamMembership[];

  upsertGenericEventType(eventType: GenericEventType): GenericEventType;
  getGenericEventType(eventTypeId: string): GenericEventType | undefined;
  listGenericEventTypes(): GenericEventType[];

  upsertGenericEvent(event: GenericEvent): GenericEvent;
  getGenericEvent(eventId: string): GenericEvent | undefined;
  listGenericEvents(teamId: string): GenericEvent[];

  upsertEventParticipant(participant: EventParticipant): EventParticipant;
  listEventParticipants(eventId: string): EventParticipant[];

  createWorkspaceMember(member: WorkspaceMember): WorkspaceMember;
  updateWorkspaceMemberRole(memberId: string, role: WorkspaceMember["role"]): WorkspaceMember | undefined;
  getWorkspaceMembership(workspaceId: string, userId: string): WorkspaceMember | undefined;
  listWorkspaceMembers(workspaceId: string): WorkspaceMember[];

  createTask(task: Task): Task;
  getTask(taskId: string): Task | undefined;
  updateTask(taskId: string, partial: Partial<Task>): Task | undefined;
  listTasks(workspaceId: string): Task[];

  createTaskAssignment(assignment: TaskAssignment): TaskAssignment;
  updateAssignment(assignmentId: string, partial: Partial<TaskAssignment>): TaskAssignment | undefined;
  getAssignment(assignmentId: string): TaskAssignment | undefined;
  listAssignmentsForAthlete(workspaceId: string, athleteId: string): Array<{ task: Task; assignment: TaskAssignment }>;

  createProgressUpdate(progress: ProgressUpdate): ProgressUpdate;
  listProgressForAssignment(assignmentId: string): ProgressUpdate[];
  getProgressUpdate(updateId: string): ProgressUpdate | undefined;

  createFeedback(feedback: CoachFeedback): CoachFeedback;
  listFeedbackByUpdate(updateId: string): CoachFeedback[];

  createCalendarEvent(event: CalendarEvent): CalendarEvent;
  updateCalendarEvent(eventId: string, partial: Partial<CalendarEvent>): CalendarEvent | undefined;
  getCalendarEvent(eventId: string): CalendarEvent | undefined;
  listCalendarEvents(workspaceId: string): CalendarEvent[];

  getDashboardSummary(workspaceId: string, nowIso: string): DashboardSummary;

  reset(): void;
}
