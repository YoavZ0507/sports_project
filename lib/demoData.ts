import { repository } from "@/lib/repositories/inMemoryRepository";
import { createWorkspace, requestToJoinWorkspace, approveAthlete } from "@/lib/services/workspaceService";
import { assignTask, createTask } from "@/lib/services/taskService";
import { submitProgress, addCoachFeedback } from "@/lib/services/progressService";
import type { User } from "@/lib/types";

let seeded = false;
let primaryWorkspaceId = "";

export function ensureDemoData() {
  if (seeded) return;

  const coach: User = {
    id: "coach_demo",
    email: "coach@demo.test",
    fullName: "Demo Coach",
    locale: "en"
  };

  const athletes: User[] = [
    {
      id: "athlete_demo",
      email: "athlete@demo.test",
      fullName: "Noa Levi",
      locale: "he"
    },
    {
      id: "athlete_2",
      email: "athlete2@demo.test",
      fullName: "Daniel Cohen",
      locale: "en"
    },
    {
      id: "athlete_3",
      email: "athlete3@demo.test",
      fullName: "Maya Azulay",
      locale: "he"
    }
  ];

  repository.upsertUser(coach);
  athletes.forEach((athlete) => repository.upsertUser(athlete));

  const workspace = createWorkspace({ coachId: coach.id, coachRole: "coach", name: "High Performance Squad" });
  primaryWorkspaceId = workspace.id;
  athletes.forEach((athlete) => {
    const pending = requestToJoinWorkspace({ workspaceId: workspace.id, athleteId: athlete.id });
    approveAthlete({ workspaceId: workspace.id, memberId: pending.id, actorId: coach.id, actorRole: "coach" });
  });

  const oneTime = createTask({
    actorRole: "coach",
    actorId: coach.id,
    workspaceId: workspace.id,
    title: "Recovery Run",
    description: "30 minutes at low pace",
    scheduleType: "one_time",
    dueDate: "2026-03-10"
  });

  const recurring = createTask({
    actorRole: "coach",
    actorId: coach.id,
    workspaceId: workspace.id,
    title: "Mobility Session",
    description: "Hip and ankle mobility routine",
    scheduleType: "recurring",
    recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  });

  const oneTimeAssignments = assignTask({
    actorRole: "coach",
    taskId: oneTime.id,
    athleteIds: athletes.map((athlete) => athlete.id)
  });

  const recurringAssignments = assignTask({
    actorRole: "coach",
    taskId: recurring.id,
    athleteIds: athletes.map((athlete) => athlete.id)
  });

  const progressNoa = submitProgress({
    actorRole: "athlete",
    actorId: athletes[0].id,
    assignmentId: oneTimeAssignments[0].id,
    status: "completed",
    note: "Felt good. Kept heart rate under target.",
    metrics: [
      { metricKey: "distance_km", metricValue: 6.2 },
      { metricKey: "avg_hr", metricValue: 138, unit: "bpm" }
    ]
  });

  addCoachFeedback({
    actorRole: "coach",
    coachId: coach.id,
    updateId: progressNoa.id,
    comment: "Great control. Increase volume by 5% next week."
  });

  const progressDaniel = submitProgress({
    actorRole: "athlete",
    actorId: athletes[1].id,
    assignmentId: oneTimeAssignments[1].id,
    status: "in_progress",
    note: "Half done, finishing in evening session.",
    metrics: [
      { metricKey: "distance_km", metricValue: 3.1 },
      { metricKey: "avg_hr", metricValue: 145, unit: "bpm" }
    ]
  });

  addCoachFeedback({
    actorRole: "coach",
    coachId: coach.id,
    updateId: progressDaniel.id,
    comment: "Good start. Keep your pace stable in second half."
  });

  submitProgress({
    actorRole: "athlete",
    actorId: athletes[2].id,
    assignmentId: recurringAssignments[2].id,
    status: "blocked",
    note: "Right ankle stiffness after warmup.",
    metrics: [{ metricKey: "pain_level", metricValue: 4 }]
  });

  seeded = true;
}

export function getPrimaryWorkspaceId(): string {
  ensureDemoData();
  return primaryWorkspaceId;
}
