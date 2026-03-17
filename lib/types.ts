export type Locale = "en" | "he";
export type MembershipRole = "coach" | "athlete" | "pending";
export type AssignmentStatus = "not_started" | "in_progress" | "completed" | "blocked";
export type ScheduleType = "one_time" | "recurring";
export type TaskResourceType = "video" | "text" | "file";
export type CalendarEventType = "training" | "game" | "special";
export type TeamMembershipRole = Exclude<MembershipRole, "pending">;
export type GenericEventStatus = "planned" | "completed" | "cancelled";
export type EventParticipantRole = "player" | "coach" | "staff";
export type AttendanceStatus = "planned" | "present" | "absent" | "late" | "excused";

export interface User {
  id: string;
  email: string;
  fullName: string;
  locale: Locale;
}

export interface Workspace {
  id: string;
  name: string;
  coachId: string;
  createdAt: string;
}

export interface Sport {
  id: string;
  key: string;
  name: string;
  createdAt: string;
}

export interface Club {
  id: string;
  sportId: string;
  name: string;
  createdAt: string;
}

export interface League {
  id: string;
  sportId: string;
  name: string;
  level: string;
  createdAt: string;
}

export interface Season {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Team {
  id: string;
  sportId: string;
  clubId: string;
  leagueId: string;
  seasonId: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  clubId: string;
  userId: string;
  role: TeamMembershipRole;
  sourceWorkspaceMemberId: string;
  createdAt: string;
}

export interface GenericEventType {
  id: string;
  key: string;
  name: string;
  createdAt: string;
}

export interface GenericEvent {
  id: string;
  sourceCalendarEventId: string;
  eventTypeId: string;
  sportId: string;
  clubId: string;
  teamId: string;
  seasonId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  status: GenericEventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  participantRole: EventParticipantRole;
  attendanceStatus: AttendanceStatus;
  sourceWorkspaceMemberId?: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: MembershipRole;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  detailedInstructions?: string;
  resources: TaskResource[];
  scheduleType: ScheduleType;
  dueDate?: string;
  recurrenceRule?: string;
  archived: boolean;
  createdBy: string;
  createdAt: string;
}

export interface TaskResource {
  id: string;
  name: string;
  type: TaskResourceType;
  url: string;
  mimeType?: string;
  textPreview?: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  athleteId: string;
  status: AssignmentStatus;
  assignedAt: string;
  completedAt?: string;
}

export interface ProgressMetric {
  id: string;
  updateId: string;
  metricKey: string;
  metricValue: number;
  unit?: string;
}

export interface ProgressUpdate {
  id: string;
  assignmentId: string;
  status: AssignmentStatus;
  note: string;
  submittedAt: string;
  createdBy: string;
  metrics: ProgressMetric[];
}

export interface CoachFeedback {
  id: string;
  updateId: string;
  coachId: string;
  comment: string;
  visibility: "athlete";
  createdAt: string;
}

export interface DashboardSummary {
  completionRate: number;
  overdueCount: number;
  recentActivity: Array<{
    type: "progress" | "feedback";
    timestamp: string;
    actorId: string;
    message: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startAt: string;
  endAt: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
