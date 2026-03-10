"use client";

import { useMemo } from "react";

export function CalendarSyncActions({
  locale,
  calendarSyncUrl
}: {
  locale: string;
  calendarSyncUrl: string;
}) {
  const isHebrew = locale === "he";

  const webcalUrl = useMemo(() => calendarSyncUrl.replace(/^https?:\/\//, "webcal://"), [calendarSyncUrl]);
  const googleUrl = useMemo(
    () =>
      `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodeURIComponent(calendarSyncUrl)}`,
    [calendarSyncUrl]
  );

  return (
    <div className="calendar-sync-actions">
      <a className="rect-button" href={googleUrl} target="_blank" rel="noreferrer">
        {isHebrew ? "סנכרון ל-Google Calendar" : "Sync to Google Calendar"}
      </a>

      <a className="rect-button rect-button-secondary" href={webcalUrl}>
        {isHebrew ? "פתיחה ב-Apple/Outlook" : "Open in Apple/Outlook"}
      </a>

      <a className="rect-button rect-button-secondary" href={calendarSyncUrl}>
        {isHebrew ? "הורדת קובץ ICS" : "Download ICS"}
      </a>
    </div>
  );
}
