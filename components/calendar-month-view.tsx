import type { CalendarEvent } from "@/lib/types";

const WEEKDAY_HE = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthRange(events: CalendarEvent[]): { year: number; month: number } {
  if (events.length === 0) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const first = new Date(events[0].startAt);
  return { year: first.getFullYear(), month: first.getMonth() };
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function CalendarMonthView({ locale, events }: { locale: string; events: CalendarEvent[] }) {
  const isHebrew = locale === "he";
  const { year, month } = getMonthRange(events);

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));
  const startWeekday = monthStart.getUTCDay();
  const daysInMonth = monthEnd.getUTCDate();

  const eventMap = new Map<string, CalendarEvent[]>();
  events.forEach((event) => {
    const key = event.startAt.slice(0, 10);
    const list = eventMap.get(key) ?? [];
    list.push(event);
    eventMap.set(key, list);
  });

  const cells: Array<{ date: Date | null }> = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push({ date: null });
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(Date.UTC(year, month, day)) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null });

  const weekdays = isHebrew ? WEEKDAY_HE : WEEKDAY_EN;
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month, 1))
  );

  return (
    <section className="card">
      <h3>{isHebrew ? `לוח חודשי: ${monthLabel}` : `Monthly Calendar: ${monthLabel}`}</h3>

      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-head">
            {day}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell.date) {
            return <div key={`empty-${index}`} className="calendar-cell calendar-cell-empty" />;
          }

          const dayKey = toDayKey(cell.date);
          const dayEvents = eventMap.get(dayKey) ?? [];

          return (
            <div key={dayKey} className="calendar-cell">
              <div className="calendar-day-number">{cell.date.getUTCDate()}</div>
              <div className="calendar-events">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className={`calendar-event-pill calendar-event-${event.eventType}`}>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 ? (
                  <div className="calendar-more">+{dayEvents.length - 3}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
