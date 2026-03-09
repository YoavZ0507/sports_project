import {
  CoachFeedback,
  DashboardSummary,
  ProgressUpdate,
  Task,
  TaskAssignment,
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

  getDashboardSummary(workspaceId: string, nowIso: string): DashboardSummary;

  reset(): void;
}
