import {
  CalendarEvent,
  CoachFeedback,
  DashboardSummary,
  ProgressUpdate,
  Task,
  TaskAssignment,
  User,
  Workspace,
  WorkspaceMember
} from "@/lib/types";
import type { Repository } from "@/lib/repositories/interface";

class InMemoryRepository implements Repository {
  private users = new Map<string, User>();
  private workspaces = new Map<string, Workspace>();
  private members = new Map<string, WorkspaceMember>();
  private tasks = new Map<string, Task>();
  private assignments = new Map<string, TaskAssignment>();
  private updates = new Map<string, ProgressUpdate>();
  private feedback = new Map<string, CoachFeedback>();
  private calendarEvents = new Map<string, CalendarEvent>();

  upsertUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  createWorkspace(workspace: Workspace): Workspace {
    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  getWorkspace(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  listWorkspaces(): Workspace[] {
    return [...this.workspaces.values()];
  }

  createWorkspaceMember(member: WorkspaceMember): WorkspaceMember {
    this.members.set(member.id, member);
    return member;
  }

  updateWorkspaceMemberRole(memberId: string, role: WorkspaceMember["role"]): WorkspaceMember | undefined {
    const current = this.members.get(memberId);
    if (!current) return undefined;
    const updated = { ...current, role };
    this.members.set(memberId, updated);
    return updated;
  }

  getWorkspaceMembership(workspaceId: string, userId: string): WorkspaceMember | undefined {
    return [...this.members.values()].find((member) => member.workspaceId === workspaceId && member.userId === userId);
  }

  listWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    return [...this.members.values()].filter((member) => member.workspaceId === workspaceId);
  }

  createTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  updateTask(taskId: string, partial: Partial<Task>): Task | undefined {
    const current = this.tasks.get(taskId);
    if (!current) return undefined;
    const updated = { ...current, ...partial };
    this.tasks.set(taskId, updated);
    return updated;
  }

  listTasks(workspaceId: string): Task[] {
    return [...this.tasks.values()].filter((task) => task.workspaceId === workspaceId && !task.archived);
  }

  createTaskAssignment(assignment: TaskAssignment): TaskAssignment {
    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  updateAssignment(assignmentId: string, partial: Partial<TaskAssignment>): TaskAssignment | undefined {
    const current = this.assignments.get(assignmentId);
    if (!current) return undefined;
    const updated = { ...current, ...partial };
    this.assignments.set(assignmentId, updated);
    return updated;
  }

  getAssignment(assignmentId: string): TaskAssignment | undefined {
    return this.assignments.get(assignmentId);
  }

  listAssignmentsForAthlete(workspaceId: string, athleteId: string): Array<{ task: Task; assignment: TaskAssignment }> {
    const tasks = this.listTasks(workspaceId);
    const byTaskId = new Map(tasks.map((task) => [task.id, task]));
    return [...this.assignments.values()]
      .filter((assignment) => assignment.athleteId === athleteId)
      .map((assignment) => ({ task: byTaskId.get(assignment.taskId), assignment }))
      .filter((entry): entry is { task: Task; assignment: TaskAssignment } => Boolean(entry.task));
  }

  createProgressUpdate(progress: ProgressUpdate): ProgressUpdate {
    this.updates.set(progress.id, progress);
    return progress;
  }

  listProgressForAssignment(assignmentId: string): ProgressUpdate[] {
    return [...this.updates.values()]
      .filter((update) => update.assignmentId === assignmentId)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  }

  getProgressUpdate(updateId: string): ProgressUpdate | undefined {
    return this.updates.get(updateId);
  }

  createFeedback(feedback: CoachFeedback): CoachFeedback {
    this.feedback.set(feedback.id, feedback);
    return feedback;
  }

  listFeedbackByUpdate(updateId: string): CoachFeedback[] {
    return [...this.feedback.values()]
      .filter((entry) => entry.updateId === updateId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  createCalendarEvent(event: CalendarEvent): CalendarEvent {
    this.calendarEvents.set(event.id, event);
    return event;
  }

  updateCalendarEvent(eventId: string, partial: Partial<CalendarEvent>): CalendarEvent | undefined {
    const current = this.calendarEvents.get(eventId);
    if (!current) return undefined;
    const updated = { ...current, ...partial };
    this.calendarEvents.set(eventId, updated);
    return updated;
  }

  getCalendarEvent(eventId: string): CalendarEvent | undefined {
    return this.calendarEvents.get(eventId);
  }

  listCalendarEvents(workspaceId: string): CalendarEvent[] {
    return [...this.calendarEvents.values()]
      .filter((event) => event.workspaceId === workspaceId)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  getDashboardSummary(workspaceId: string, nowIso: string): DashboardSummary {
    const tasks = this.listTasks(workspaceId);
    const taskIds = new Set(tasks.map((task) => task.id));
    const workspaceAssignments = [...this.assignments.values()].filter((assignment) => taskIds.has(assignment.taskId));

    const completed = workspaceAssignments.filter((assignment) => assignment.status === "completed").length;
    const completionRate = workspaceAssignments.length === 0 ? 0 : Math.round((completed / workspaceAssignments.length) * 100);

    const now = new Date(nowIso);
    const overdueTaskIds = new Set(
      tasks
        .filter((task) => task.dueDate && new Date(task.dueDate) < now)
        .map((task) => task.id)
    );
    const overdueCount = workspaceAssignments.filter(
      (assignment) => overdueTaskIds.has(assignment.taskId) && assignment.status !== "completed"
    ).length;

    const activity = [
      ...[...this.updates.values()].map((update) => ({
        type: "progress" as const,
        timestamp: update.submittedAt,
        actorId: update.createdBy,
        message: `Updated assignment ${update.assignmentId} with status ${update.status}`
      })),
      ...[...this.feedback.values()].map((entry) => ({
        type: "feedback" as const,
        timestamp: entry.createdAt,
        actorId: entry.coachId,
        message: `Left feedback on update ${entry.updateId}`
      }))
    ]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 15);

    return {
      completionRate,
      overdueCount,
      recentActivity: activity
    };
  }

  reset(): void {
    this.users.clear();
    this.workspaces.clear();
    this.members.clear();
    this.tasks.clear();
    this.assignments.clear();
    this.updates.clear();
    this.feedback.clear();
    this.calendarEvents.clear();
  }
}

export const repository = new InMemoryRepository();
