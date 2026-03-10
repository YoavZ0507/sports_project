import { createId } from "@/lib/ids";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { isCoachInWorkspace } from "@/lib/workspaceAccess";
import type { CalendarEvent } from "@/lib/types";

export function createCalendarEvent(input: {
  actorId: string;
  actorRole: "coach" | "athlete";
  workspaceId: string;
  title: string;
  description?: string;
  eventType: CalendarEvent["eventType"];
  startAt: string;
  endAt: string;
  location?: string;
}): CalendarEvent {
  if (input.actorRole !== "coach" || !isCoachInWorkspace(input.workspaceId, input.actorId)) {
    throw new Error("unauthorized");
  }

  const event: CalendarEvent = {
    id: createId("event"),
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    eventType: input.eventType,
    startAt: input.startAt,
    endAt: input.endAt,
    location: input.location,
    createdBy: input.actorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return repository.createCalendarEvent(event);
}

export function updateCalendarEvent(input: {
  actorId: string;
  actorRole: "coach" | "athlete";
  eventId: string;
  patch: Partial<Pick<CalendarEvent, "title" | "description" | "eventType" | "startAt" | "endAt" | "location">>;
}): CalendarEvent {
  const existing = repository.getCalendarEvent(input.eventId);
  if (!existing) throw new Error("event not found");

  if (input.actorRole !== "coach" || !isCoachInWorkspace(existing.workspaceId, input.actorId)) {
    throw new Error("unauthorized");
  }

  const updated = repository.updateCalendarEvent(input.eventId, {
    ...input.patch,
    updatedAt: new Date().toISOString()
  });

  if (!updated) throw new Error("event not found");
  return updated;
}

export function listCalendarEventsForUser(input: {
  actorId: string;
  actorRole: "coach" | "athlete";
  workspaceId: string;
}): CalendarEvent[] {
  const membership = repository.getWorkspaceMembership(input.workspaceId, input.actorId);

  if (input.actorRole === "coach") {
    if (!isCoachInWorkspace(input.workspaceId, input.actorId)) {
      throw new Error("unauthorized");
    }
    return repository.listCalendarEvents(input.workspaceId);
  }

  if (!membership || membership.role !== "athlete") {
    throw new Error("unauthorized");
  }

  return repository.listCalendarEvents(input.workspaceId);
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatDateForIcs(isoDate: string): string {
  return isoDate.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcsCalendar(input: {
  name: string;
  events: CalendarEvent[];
  sourceUrl: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Athlete Task Hub//Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(input.name)}`,
    `X-WR-CALDESC:${escapeText("Team schedule sync feed")}`
  ];

  input.events.forEach((event) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@athlete-task-hub`);
    lines.push(`DTSTAMP:${formatDateForIcs(event.updatedAt)}`);
    lines.push(`DTSTART:${formatDateForIcs(event.startAt)}`);
    lines.push(`DTEND:${formatDateForIcs(event.endAt)}`);
    lines.push(`SUMMARY:${escapeText(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
    lines.push(`CATEGORIES:${event.eventType.toUpperCase()}`);
    lines.push(`URL:${escapeText(input.sourceUrl)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
