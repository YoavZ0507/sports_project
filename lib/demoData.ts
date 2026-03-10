import { repository } from "@/lib/repositories/inMemoryRepository";
import { createWorkspace, requestToJoinWorkspace, approveAthlete } from "@/lib/services/workspaceService";
import { assignTask, createTask } from "@/lib/services/taskService";
import { submitProgress, addCoachFeedback } from "@/lib/services/progressService";
import { createCalendarEvent } from "@/lib/services/calendarService";
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
    detailedInstructions:
      "Warm up for 8 minutes, keep breathing controlled, then run 30 minutes in zone 2. Finish with 5-minute cooldown walk.",
    resources: [
      {
        id: "res_demo_video_1",
        name: "Recovery Run Technique Video",
        type: "video",
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        mimeType: "video/mp4"
      },
      {
        id: "res_demo_text_1",
        name: "Pacing Notes",
        type: "text",
        url: "data:text/plain;base64,UmVjb3ZlcnkgcnVuOiBrZWVwIHBhY2UgY29uc2VydmF0aXZlLCBkb24ndCBjcm9zcyBhbmFlcm9iaWMgem9uZS4=",
        textPreview: "Recovery run: keep pace conservative, don't cross anaerobic zone."
      }
    ],
    scheduleType: "one_time",
    dueDate: "2026-03-10"
  });

  const recurring = createTask({
    actorRole: "coach",
    actorId: coach.id,
    workspaceId: workspace.id,
    title: "Mobility Session",
    description: "Hip and ankle mobility routine",
    detailedInstructions:
      "3 rounds: hip openers 45s each side, ankle dorsiflexion drill 12 reps, deep squat hold 60s. Focus on quality over speed.",
    resources: [],
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

  createCalendarEvent({
    actorId: coach.id,
    actorRole: "coach",
    workspaceId: workspace.id,
    title: "Morning Team Training",
    description: "Speed work + tactical sequence rehearsal.",
    eventType: "training",
    startAt: "2026-03-12T07:00:00.000Z",
    endAt: "2026-03-12T09:00:00.000Z",
    location: "National Track"
  });

  createCalendarEvent({
    actorId: coach.id,
    actorRole: "coach",
    workspaceId: workspace.id,
    title: "League Match - Round 8",
    description: "Home game, arrive 90 minutes before kickoff.",
    eventType: "game",
    startAt: "2026-03-14T17:30:00.000Z",
    endAt: "2026-03-14T20:00:00.000Z",
    location: "City Stadium"
  });

  seeded = true;
}

export function getPrimaryWorkspaceId(): string {
  ensureDemoData();
  return primaryWorkspaceId;
}
