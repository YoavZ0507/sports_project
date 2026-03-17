"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CalendarEvent } from "@/lib/types";
import { CalendarMonthView } from "@/components/calendar-month-view";
import { CalendarSyncActions } from "@/components/calendar-sync-actions";

const EVENT_TYPE_OPTIONS: Array<{ value: CalendarEvent["eventType"]; he: string; en: string }> = [
  { value: "training", he: "אימון", en: "Training" },
  { value: "game", he: "משחק", en: "Game" },
  { value: "special", he: "אירוע מיוחד", en: "Special Event" }
];

function toLocalDatetimeValue(iso: string): string {
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function CoachCalendarManager({
  locale,
  workspaceId,
  events,
  calendarSyncUrl
}: {
  locale: string;
  workspaceId: string;
  events: CalendarEvent[];
  calendarSyncUrl: string;
}) {
  const router = useRouter();
  const isHebrew = locale === "he";

  const now = new Date();
  const plusHour = new Date(now.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<CalendarEvent["eventType"]>("training");
  const [startAt, setStartAt] = useState(toLocalDatetimeValue(now.toISOString()));
  const [endAt, setEndAt] = useState(toLocalDatetimeValue(plusHour.toISOString()));
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title,
          description,
          eventType,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          location
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Failed to create event");
        return;
      }

      setTitle("");
      setDescription("");
      setLocation("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="coach-task-layout">
      <form className="card auth-form" onSubmit={onSubmit}>
        <h2>{isHebrew ? "לוח שנה קבוצתי" : "Team Calendar"}</h2>

        <label>
          {isHebrew ? "כותרת מופע" : "Event title"}
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          {isHebrew ? "סוג" : "Type"}
          <select value={eventType} onChange={(e) => setEventType(e.target.value as CalendarEvent["eventType"])}>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {isHebrew ? option.he : option.en}
              </option>
            ))}
          </select>
        </label>

        <label>
          {isHebrew ? "תחילת מופע" : "Start"}
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        </label>

        <label>
          {isHebrew ? "סיום מופע" : "End"}
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        </label>

        <label>
          {isHebrew ? "מיקום" : "Location"}
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>

        <label>
          {isHebrew ? "פירוט" : "Description"}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="rect-button" type="submit" disabled={loading}>
          {isHebrew ? "הוספת מופע ללוז" : "Add event to schedule"}
        </button>
      </form>

      <section className="card">
        <h2>{isHebrew ? "סנכרון ליומן אישי" : "Personal Calendar Sync"}</h2>
        <article className="panel-link-card static-card">
          <p>
            {isHebrew
              ? "בחר את אפליקציית היומן שלך לסנכרון אוטומטי של לוח השנה."
              : "Choose your calendar app to sync this schedule automatically."}
          </p>
          <CalendarSyncActions locale={locale} calendarSyncUrl={calendarSyncUrl} />
        </article>

        <CalendarMonthView locale={locale} events={events} />

        <h3>{isHebrew ? "מופעים בלוח" : "Scheduled Events"}</h3>
        <div className="resource-grid">
          {events.length === 0 ? (
            <article className="panel-link-card static-card">
              <p>{isHebrew ? "אין מופעים בלוח השנה" : "No events in calendar"}</p>
            </article>
          ) : (
            events.map((item) => (
              <article key={item.id} className="panel-link-card static-card">
                <h3>{item.title}</h3>
                <p>{isHebrew ? "סוג" : "Type"}: {item.eventType}</p>
                <p>{isHebrew ? "התחלה" : "Start"}: {new Date(item.startAt).toLocaleString(locale)}</p>
                <p>{isHebrew ? "סיום" : "End"}: {new Date(item.endAt).toLocaleString(locale)}</p>
                {item.location ? <p>{isHebrew ? "מיקום" : "Location"}: {item.location}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
