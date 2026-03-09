export type Locale = "en" | "he";
export type MembershipRole = "coach" | "athlete" | "pending";
export type AssignmentStatus = "not_started" | "in_progress" | "completed" | "blocked";
export type ScheduleType = "one_time" | "recurring";
export type TaskResourceType = "video" | "text" | "file";

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
